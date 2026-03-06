import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { CreateExpedienteDto } from './dto/create-expediente.dto';
import { UpdateExpedienteDto } from './dto/update-expediente.dto';
import { InjectDataSource, InjectRepository } from '@nestjs/typeorm';
import { DataSource, In, Repository } from 'typeorm';
import { Expediente } from './entities/expediente.entity';
import { HandleService } from '../utils/handle.service';
import { EstadoExpediente } from '../enum/estado-expediente';
import { TipoExpediente } from '../tipo-expediente/entities/tipo-expediente.entity';
import { Contribuyente } from '../contribuyente/entities/contribuyente.entity';
import { DatosCatastrales } from '../datos-catastrales/entities/datos-catastrales.entity';
import { RequisitoTipoExpediente } from '../requisito-tipo-expediente/entities/requisito-tipo-expediente.entity';
import { Documento } from '../documento/entities/documento.entity';
import { EstadoDocumento } from '../enum/estado-documento';



@Injectable()
export class ExpedienteService extends HandleService {

  constructor(
    @InjectRepository(Expediente)
    private readonly expedienteRepository: Repository<Expediente>,

    @InjectDataSource()
    private readonly dataSource: DataSource,

  ) {
    super();
  }

async create(dto: CreateExpedienteDto): Promise<Expediente> {

  return this.dataSource.transaction(async (manager) => {
    const expedienteRepository = manager.getRepository(Expediente);
    const contribuyenteRepository = manager.getRepository(Contribuyente);
    const tipoExpedienteRepository = manager.getRepository(TipoExpediente);
    const requisitoRepository = manager.getRepository(RequisitoTipoExpediente);
    const documentoRepository = manager.getRepository(Documento);
    const datosCatastralesRepository = manager.getRepository(DatosCatastrales);

  
    const existing = await expedienteRepository.findOneBy({ numeroGde: dto.numeroGde });
    if (existing) {
      throw new ConflictException(`Ya existe un expediente con número GDE ${dto.numeroGde}`);
    }

    // Buscar contribuyente
    const contribuyente = await contribuyenteRepository.findOne({
      where: { idContribuyente: dto.idContribuyente },
    });

    if (!contribuyente) {
      throw new NotFoundException('El contribuyente no existe');
    }

    // Buscar tipo de expediente
    const tipoExpediente = await tipoExpedienteRepository.findOne({
      where: { idTipoExpediente: dto.idTipoExpediente },
    });

    if (!tipoExpediente) {
      throw new NotFoundException('El tipo de expediente no existe');
    }

    // Buscar expediente padre solo si se envía
    let expedientePadre: Expediente | null = null;

    if (dto.idExpedientePadre) {
      expedientePadre = await expedienteRepository.findOne({
        where: { idExpediente: dto.idExpedientePadre },
      });

      if (!expedientePadre) {
        throw new NotFoundException('El expediente padre no existe');
      }
    }

    // Crear entidad DatosCatastrales
    const datosCatastrales = datosCatastralesRepository.create(dto.datosCatastrales);

    // Crear expediente
    const expediente = expedienteRepository.create({
      numeroGde: dto.numeroGde,
      datosFormulario: dto.datosFormulario ?? null,
      estado: dto.estado ?? EstadoExpediente.INICIADO,
      contribuyente,
      tipoExpediente,
      expedientePadre,
      datosCatastrales,
    });

    // Guardar expediente
    const expedienteGuardado = await expedienteRepository.save(expediente);

    // Buscar requisitos del tipo de expediente
    const requisitos = await requisitoRepository.find({
      where: { tipoExpediente: { idTipoExpediente: dto.idTipoExpediente } },
      relations: ['tipoDocumento'],
    });

    // Crear documentos pendientes automáticamente
    if (requisitos.length > 0) {
        const documentos = requisitos.map((req) =>
        documentoRepository.create({
          expediente: expedienteGuardado,
          tipoDocumento: req.tipoDocumento,
          estado: EstadoDocumento.PENDIENTE_CARGA,
          nombreArchivo: '',
          rutaAlmacenamiento: '',
        })
      );
      await documentoRepository.save(documentos);
    }
    return expedienteGuardado;
  });
}

//FILTROS PARA DEVOLVER EXPEDIENTES

  findAll(): Promise<Expediente[]> {
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
      'documentos.usuarioRevisor',
      'documentos.tipoDocumento',
      'datosCatastrales',
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
      relations: ['contribuyente', 'tipoExpediente', 'expedientePadre'],
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
    relations: ['tipoExpediente', 'expedientePadre'], 
    order: { fechaCreacion: 'DESC' },
  });
}

//FILTRO PARA LLEVAR LOS EXPEDEDIENTES QUE LE CORRESPONDEN A CADA SECTOR
async findBySectorResponsable(idSector: number): Promise<Expediente[]> {
  console.log('ID del sector:', idSector);
  return this.expedienteRepository.find({
    where: {
      tipoExpediente: {
        sectorResponsable: {
          idSector: idSector, 
        },
      },
    },
    relations: ['tipoExpediente', 'contribuyente', 'documentos', 'datosCatastrales'],
    order: { fechaCreacion: 'DESC' },
  });
}


  // Devuelve todos los sub-expedientes vinculados a un expediente padre
   /* async findHijos(idExpedientePadre: number): Promise<Expediente[]> {
      return this.expedienteRepository.find({
        where: {
          expedientePadre: {
            idExpediente: idExpedientePadre,
          },
        },
        relations: ['tipoExpediente', 'expedientePadre'],
        order: { fechaCreacion: 'DESC' },
      });
    }*/


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

async updateFormulario(id: number, datosFormulario: any) {
    const expediente = await this.expedienteRepository.findOne({
      where: { idExpediente: id },
    });

    if (!expediente) {
      throw new NotFoundException('Expediente no encontrado');
    }

    expediente.datosFormulario = datosFormulario;

    return this.expedienteRepository.save(expediente);
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