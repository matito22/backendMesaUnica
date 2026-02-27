import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { CreateExpedienteDto } from './dto/create-expediente.dto';
import { UpdateExpedienteDto } from './dto/update-expediente.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Expediente } from './entities/expediente.entity';
import { HandleService } from '../utils/handle.service';
import { EstadoExpediente } from 'src/enum/estado-expediente';
import { TipoExpediente } from 'src/tipo-expediente/entities/tipo-expediente.entity';
import { Contribuyente } from 'src/contribuyente/entities/contribuyente.entity';

@Injectable()
export class ExpedienteService extends HandleService {

  constructor(
    @InjectRepository(Expediente)
    private readonly expedienteRepository: Repository<Expediente>,

    @InjectRepository(TipoExpediente)
    private readonly tipoExpedienteRepository: Repository<TipoExpediente>,

    @InjectRepository(Contribuyente)
    private readonly contribuyenteRepository: Repository<Contribuyente>
  ) {
    super();
  }

 async create(dto: CreateExpedienteDto): Promise<Expediente> {

  const existing = await this.expedienteRepository.findOneBy({
    numeroGde: dto.numeroGde
  });

  if (existing) {
    throw new ConflictException(
      `Ya existe un expediente con número GDE ${dto.numeroGde}`
    );
  }

  // 1️⃣ Validar contribuyente
  const contribuyente = await this.contribuyenteRepository.findOne({
    where: { idContribuyente: dto.idContribuyente }
  });

  if (!contribuyente) {
    throw new NotFoundException('El contribuyente no existe');
  }

  // 2️⃣ Validar tipo expediente
  const tipoExpediente = await this.tipoExpedienteRepository.findOne({
    where: { idTipoExpediente: dto.idTipoExpediente }
  });

  const expedientePadre= await this.expedienteRepository.findOne({
    where: { idExpediente: dto.idExpedientePadre }
  });

  if (!tipoExpediente) {
    throw new NotFoundException('El tipo de expediente no existe');
  }

  // 3️⃣ Crear entidad correctamente
  const expediente = this.expedienteRepository.create({
    numeroGde: dto.numeroGde,
    datosFormulario: dto.datosFormulario ?? null,
    estado: dto.estado ?? EstadoExpediente.INICIADO,
    contribuyente: contribuyente,
    tipoExpediente: tipoExpediente,
    expedientePadre: expedientePadre || null,
  });

  return this.expedienteRepository.save(expediente);
}


  findAll(): Promise<Expediente[]> {
    // FIX: la relación se llama 'contribuyente', no 'idContribuyente' (corregido en la entidad)
    return this.expedienteRepository.find({
      relations: ['contribuyente', 'tipoExpediente', 'expedientePadre'],
      where: [
        { estado: EstadoExpediente.INICIADO },
        { estado: EstadoExpediente.EN_REVISION }
      ],
      order: { fechaCreacion: 'DESC' }
    });
  }

  async findOne(idExpediente: number): Promise<Expediente> {
    const expediente = await this.expedienteRepository.findOne({
      where: { idExpediente },
       relations: [
      'contribuyente',
      'tipoExpediente',
      'tipoExpediente.requisitos',               
      'tipoExpediente.requisitos.tipoDocumento', 
      'expedientePadre',
      'documentos',
      'documentos.tipoDocumento',              
    ],
    });
    return this.handleException(
      expediente,
      NotFoundException,
      `Expediente con ID ${idExpediente} no encontrado`
    );
  }

  async findByNumeroGde(numeroGde: string): Promise<Expediente> {
    const expediente = await this.expedienteRepository.findOne({
      where: { numeroGde },
      relations: ['contribuyente', 'tipoExpediente', 'expedientePadre'], // FIX: nombres correctos
    });
    return this.handleException(
      expediente,
      NotFoundException,
      `Expediente con número GDE ${numeroGde} no encontrado`
    );
  }

async findByContribuyente(idContribuyente: number): Promise<Expediente[]> {
  return this.expedienteRepository.find({
    where: {
      contribuyente: {
        idContribuyente: idContribuyente,
      },
    },
    relations: ['tipoExpediente', 'expedientePadre'], // FIX: nombres correctos
    order: { fechaCreacion: 'DESC' },
  });
}


  // Devuelve todos los sub-expedientes vinculados a un expediente padre
    async findHijos(idExpedientePadre: number): Promise<Expediente[]> {
      return this.expedienteRepository.find({
        where: {
          expedientePadre: {
            idExpediente: idExpedientePadre,
          },
        },
        relations: ['tipoExpediente', 'expedientePadre'],
        order: { fechaCreacion: 'DESC' },
      });
    }


  async update(id: number, updateExpedienteDto: UpdateExpedienteDto): Promise<Expediente> {
    let existingExpediente = await this.expedienteRepository.findOneBy({ idExpediente: id });
    existingExpediente = this.handleException(
      existingExpediente,
      NotFoundException,
      `Expediente con ID ${id} no encontrado`
    );

    if (updateExpedienteDto.numeroGde && updateExpedienteDto.numeroGde !== existingExpediente.numeroGde) {
      const duplicateGde = await this.expedienteRepository.findOneBy({
        numeroGde: updateExpedienteDto.numeroGde
      });
      if (duplicateGde) {
        throw new ConflictException(
          `Ya existe un expediente con número GDE ${updateExpedienteDto.numeroGde}`
        );
      }
    }

    Object.assign(existingExpediente, updateExpedienteDto);
    return this.expedienteRepository.save(existingExpediente);
  }

  async remove(id: number) {
    let existingExpediente = await this.expedienteRepository.findOneBy({ idExpediente: id });
    existingExpediente = this.handleException(
      existingExpediente,
      NotFoundException,
      `Expediente con ID ${id} no encontrado`
    );
    return this.expedienteRepository.remove(existingExpediente);
  }
}