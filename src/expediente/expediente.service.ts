import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { CreateExpedienteDto } from './dto/create-expediente.dto';
import { UpdateExpedienteDto } from './dto/update-expediente.dto';
import { InjectDataSource, InjectRepository } from '@nestjs/typeorm';
import { DataSource, Repository } from 'typeorm';
import { Expediente } from './entities/expediente.entity';
import { HandleService } from '../utils/handle.service';
import { EstadoExpediente } from '../enum/estado-expediente';
import { TipoExpediente } from '../tipo-expediente/entities/tipo-expediente.entity';
import { Contribuyente } from '../contribuyente/entities/contribuyente.entity';
import { DatosCatastrales } from '../datos-catastrales/entities/datos-catastrales.entity';
import { RequisitoTipoExpediente } from '../requisito-tipo-expediente/entities/requisito-tipo-expediente.entity';
import { Documento } from '../documento/entities/documento.entity';
import { EstadoDocumento } from '../enum/estado-documento';
import { CambiarEstadoDto } from './dto/cambiar-estado.dto';

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

  // [S-12] Crea el expediente y genera automáticamente sus documentos en PENDIENTE_CARGA.
  // Todo en una transacción para que si algo falla, no queden registros a medias.
  async create(dto: CreateExpedienteDto): Promise<Expediente> {
    return this.dataSource.transaction(async (manager) => {
      const expedienteRepository = manager.getRepository(Expediente);
      const contribuyenteRepository = manager.getRepository(Contribuyente);
      const tipoExpedienteRepository = manager.getRepository(TipoExpediente);
      const requisitoRepository = manager.getRepository(RequisitoTipoExpediente);
      const documentoRepository = manager.getRepository(Documento);
      const datosCatastralesRepository = manager.getRepository(DatosCatastrales);

    

      const existing = await expedienteRepository.findOneBy({ numeroGde: dto.numeroGde });
      if (existing) throw new ConflictException(`Ya existe un expediente con número GDE ${dto.numeroGde}`);

      const contribuyente = await contribuyenteRepository.findOne({ where: { idContribuyente: dto.idContribuyente } });
      if (!contribuyente) throw new NotFoundException('El contribuyente no existe');

      const tipoExpediente = await tipoExpedienteRepository.findOne({ where: { idTipoExpediente: dto.idTipoExpediente } });
      if (!tipoExpediente) throw new NotFoundException('El tipo de expediente no existe');

      // El expediente padre es opcional: solo existe si este es un sub-trámite de otro
      let expedientePadre: Expediente | null = null;
      if (dto.idExpedientePadre) {
        expedientePadre = await expedienteRepository.findOne({ where: { idExpediente: dto.idExpedientePadre } });
        if (!expedientePadre) throw new NotFoundException('El expediente padre no existe');
      }

      
      const datosCatastrales = datosCatastralesRepository.create(dto.datosCatastrales);

      const expediente = expedienteRepository.create({
        numeroGde: dto.numeroGde,
        datosFormulario: dto.datosFormulario ?? null,
        estado: dto.estado ?? EstadoExpediente.INICIADO, // Si no se especifica estado, arranca como INICIADO
        contribuyente,
        tipoExpediente,
        expedientePadre,
        datosCatastrales,
      });

      const expedienteGuardado = await expedienteRepository.save(expediente);

      // Buscamos los requisitos del tipo para crear los documentos pendientes automáticamente
      const requisitos = await requisitoRepository.find({
        where: { tipoExpediente: { idTipoExpediente: dto.idTipoExpediente } },
        relations: ['tipoDocumento'],
      });

      if (requisitos.length > 0) {
        // Un documento PENDIENTE_CARGA por cada requisito del tipo de expediente
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

  // [S-13] Solo devuelve expedientes activos (INICIADO o EN_REVISION) para no saturar la vista.
 async  findAll({page,limit}:{page:number,limit:number}): Promise<{ data: Expediente[]; total: number }> {
    //El skip es el que marca desde donde tiene que empezar a mostrar
     const skip = (page-1)*limit;
    const [data, total] = await this.expedienteRepository.findAndCount({
      relations: ['contribuyente', 'tipoExpediente', 'expedientePadre'],
      where: [
        { estado: EstadoExpediente.INICIADO },
        { estado: EstadoExpediente.EN_REVISION }
      ],
      take: limit,
      skip: skip,
      order: { fechaCreacion: 'DESC' }
    });

    return { data, total };
  }

  // [S-19] Carga el expediente con todas sus relaciones para la vista de detalle.
  async findOne(idExpediente: number): Promise<Expediente> {
    const expediente = await this.expedienteRepository.findOne({
      where: { idExpediente },
      relations: [
        'contribuyente',
        'tipoExpediente',
        'tipoExpediente.requisitos',
        'tipoExpediente.requisitos.tipoDocumento',
        'tipoExpediente.sectorResponsable',
        'expedientePadre',
        'documentos',
        'documentos.usuarioRevisor',
        'documentos.tipoDocumento',
        'datosCatastrales',
        
      ],
    });
    return this.handleException(expediente, NotFoundException, `Expediente con ID ${idExpediente} no encontrado`);
  }

  //Busca por slug
  async findBySlug(slug: string): Promise<Expediente> {
  const expediente = await this.expedienteRepository.findOne({
    where: { slug },
    relations: [
      'contribuyente',
      'tipoExpediente',
      'tipoExpediente.requisitos',
      'tipoExpediente.requisitos.tipoDocumento',
      'tipoExpediente.sectorResponsable',
      'expedientePadre',
      'documentos',
      'documentos.usuarioRevisor',
      'documentos.tipoDocumento',
      'datosCatastrales',
    ],
  });
  return this.handleException(expediente, NotFoundException, 'Expediente no encontrado');
}

  // [S-14] Busca por número GDE.
  async findByNumeroGde(numeroGde: string): Promise<Expediente> {
    const expediente = await this.expedienteRepository.findOne({
      where: { numeroGde },
      relations: ['contribuyente', 'tipoExpediente', 'expedientePadre'],
    });
    return this.handleException(expediente, NotFoundException, `Expediente con número GDE ${numeroGde} no encontrado`);
  }

  // [S-15] Devuelve todos los trámites del ciudadano.
    async findByContribuyente(idContribuyente: number,{ page, limit }: { page: number; limit: number }): Promise<{ data: Expediente[]; total: number }> {
      const [data, total] = await this.expedienteRepository.findAndCount({
        where: { contribuyente: { idContribuyente } },
        relations: ['tipoExpediente', 'expedientePadre', 'contribuyente'],
        take: limit,
        skip: (page - 1) * limit,
        order: { fechaCreacion: 'DESC' },
      });
      return { data, total };
    }

  // [S-16] Filtra los expedientes por el sector que los debe revisar.
  async findBySectorResponsable(idSector: number,{ page, limit }: { page: number; limit: number }): Promise<{ data: Expediente[]; total: number }> {
    const [data, total] = await this.expedienteRepository.findAndCount({
      where: {
        tipoExpediente: { sectorResponsable: { idSector } },
      },
      relations: ['tipoExpediente', 'contribuyente', 'documentos', 'datosCatastrales'],
      take: limit,
      skip: (page - 1) * limit,
      order: { fechaCreacion: 'DESC' },
    });

    return { data, total };
  }

  // [S-18] Actualiza los campos del expediente. Verifica duplicado de GDE solo si cambió.
  async update(id: number, updateExpedienteDto: UpdateExpedienteDto): Promise<Expediente> {
    let existingExpediente = await this.expedienteRepository.findOneBy({ idExpediente: id });
    existingExpediente = this.handleException(existingExpediente, NotFoundException, `Expediente con ID ${id} no encontrado`);

    if (updateExpedienteDto.numeroGde && updateExpedienteDto.numeroGde !== existingExpediente.numeroGde) {
      const duplicateGde = await this.expedienteRepository.findOneBy({ numeroGde: updateExpedienteDto.numeroGde });
      if (duplicateGde) throw new ConflictException(`Ya existe un expediente con número GDE ${updateExpedienteDto.numeroGde}`);
    }

    Object.assign(existingExpediente, updateExpedienteDto);
    return this.expedienteRepository.save(existingExpediente);
  }

  // [S-17] Actualiza solo el campo datosFormulario sin tocar el resto del expediente.
  async updateFormulario(id: number, datosFormulario: any) {
    const expediente = await this.expedienteRepository.findOne({ where: { idExpediente: id } });
    if (!expediente) throw new NotFoundException('Expediente no encontrado');
    expediente.datosFormulario = datosFormulario;
    return this.expedienteRepository.save(expediente);
  }

  // [S-20] Elimina el expediente.
  async remove(id: number) {
    let existingExpediente = await this.expedienteRepository.findOneBy({ idExpediente: id });
    existingExpediente = this.handleException(existingExpediente, NotFoundException, `Expediente con ID ${id} no encontrado`);
    return this.expedienteRepository.remove(existingExpediente);
  }


private calcularEstadoExpediente(documentos: Documento[]): EstadoExpediente {

  // Si todos están aprobados → trámite terminado
  if (documentos.every(d => d.estado === EstadoDocumento.APROBADO)) {
    return EstadoExpediente.FINALIZADO;
  }

  // Si hay al menos uno CARGADO → el municipio tiene algo para revisar
  if (documentos.some(d => d.estado === EstadoDocumento.CARGADO)) {
    return EstadoExpediente.EN_REVISION;
  }

  // Ninguno está CARGADO: si todos son PENDIENTE_RESUBIDA / APROBADO / PENDIENTE_CARGA
  // y al menos uno está PENDIENTE_RESUBIDA → el ciudadano debe resubir
  if (
    documentos.every(d =>
      d.estado === EstadoDocumento.PENDIENTE_RESUBIDA ||
      d.estado === EstadoDocumento.APROBADO ||
      d.estado === EstadoDocumento.PENDIENTE_CARGA
    ) &&
    documentos.some(d => d.estado === EstadoDocumento.PENDIENTE_RESUBIDA)
  ) {
    return EstadoExpediente.PENDIENTE_RESUBIDA;
  }

  // Si ninguno fue cargado todavía → recién arrancó
  if (documentos.every(d => d.estado === EstadoDocumento.PENDIENTE_CARGA)) {
    return EstadoExpediente.INICIADO;
  }

  // Caso intermedio: mix sin CARGADO (ej: PENDIENTE_CARGA + APROBADO)
  return EstadoExpediente.EN_PROGRESO;
}

async cambiarEstado(cambiarEstadoDto: CambiarEstadoDto) {
  const expediente = await this.expedienteRepository.findOne({
    where: { idExpediente: cambiarEstadoDto.idExpediente },
    relations: ['documentos'],
  });
  if (!expediente) throw new NotFoundException('Expediente no encontrado');

  expediente.estado = this.calcularEstadoExpediente(expediente.documentos);
  return this.expedienteRepository.save(expediente);
}

}