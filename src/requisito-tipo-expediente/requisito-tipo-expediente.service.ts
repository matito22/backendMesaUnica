import {
  Injectable,
  NotFoundException,
  ConflictException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { RequisitoTipoExpediente } from './entities/requisito-tipo-expediente.entity';
import { CreateRequisitoTipoExpedienteDto } from './dto/create-requisito-tipo-expediente.dto';
import { UpdateRequisitoTipoExpedienteDto } from './dto/update-requisito-tipo-expediente.dto';
import { HandleService } from 'src/utils/handle.service';



@Injectable()
export class RequisitoTipoExpedienteService extends HandleService {
  constructor(
    @InjectRepository(RequisitoTipoExpediente)
    private readonly requisitoRepository: Repository<RequisitoTipoExpediente>,
  ) {
    super();
  }

  async create(
    dto: CreateRequisitoTipoExpedienteDto,
  ): Promise<RequisitoTipoExpediente> {

    const existe = await this.requisitoRepository.findOne({
      where: {
        idTipoExpediente: dto.idTipoExpediente,
        idTipoDocumento:  dto.idTipoDocumento,
      },
    });

    if (existe) {
      throw new ConflictException(
        `El documento ${dto.idTipoDocumento} ya es requisito del tipo de expediente ${dto.idTipoExpediente}`,
      );
    }

    const nuevo = this.requisitoRepository.create({
      idTipoExpediente: dto.idTipoExpediente,
      idTipoDocumento:  dto.idTipoDocumento,
      esObligatorio:    dto.esObligatorio ?? true,
    });

    await this.requisitoRepository.save(nuevo);

    return this.findOne(dto.idTipoExpediente, dto.idTipoDocumento);
  }


async findOne(idTipoExpediente: number,idTipoDocumento: number,):Promise<RequisitoTipoExpediente> {
   
   const requisito = await this.requisitoRepository.findOne({
     where: { idTipoExpediente, idTipoDocumento },
     relations: ['tipoExpediente', 'tipoDocumento'],
   });

   return this.handleException(
     requisito,
     NotFoundException,
     `No existe el requisito: tipo_expediente=${idTipoExpediente}, tipo_documento=${idTipoDocumento}`,
   );

  }
  

  async update(
    idTipoExpediente: number,
    idTipoDocumento: number,
    dto: UpdateRequisitoTipoExpedienteDto,
  ): Promise<RequisitoTipoExpediente> {

    await this.findOne(idTipoExpediente, idTipoDocumento);


    await this.requisitoRepository.update(
      { idTipoExpediente, idTipoDocumento },
      { esObligatorio: dto.esObligatorio },
    );

    return this.findOne(idTipoExpediente, idTipoDocumento);
  }


  async remove(
    idTipoExpediente: number,
    idTipoDocumento: number,
  ): Promise<{ mensaje: string }> {
    const requisito = await this.requisitoRepository.findOne({
      where: { idTipoExpediente, idTipoDocumento },
      relations: ['tipoExpediente', 'tipoDocumento'],
    });

    if (!requisito) {
      throw new NotFoundException(
        `No existe el requisito: tipo_expediente=${idTipoExpediente}, tipo_documento=${idTipoDocumento}`,
      );
    }

    await this.requisitoRepository.delete({ idTipoExpediente, idTipoDocumento });

    return {
      mensaje: `El documento "${requisito.tipoDocumento?.nombre}" fue eliminado como requisito de "${requisito.tipoExpediente?.nombre}"`,
    };
  }

  async findRequisitosRaw(
    idTipoExpediente: number,
  ): Promise<RequisitoTipoExpediente[]> {
    return this.requisitoRepository.find({
      where: { idTipoExpediente },
      relations: ['tipoDocumento'],
    });
  }
}