import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateDocumentoDto } from './dto/create-documento.dto';
import { UpdateDocumentoDto } from './dto/update-documento.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Documento } from './entities/documento.entity';
import { HandleService } from '../utils/handle.service';
import { EstadoDocumento } from 'src/enum/estado-documento';

@Injectable()
export class DocumentoService extends HandleService {

  constructor(
    @InjectRepository(Documento)
    private readonly documentoRepository: Repository<Documento>
  ) {
    super();
  }

  async create(createDocumentoDto: CreateDocumentoDto): Promise<Documento> {
    const documento = this.documentoRepository.create({
      idExpediente: createDocumentoDto.idExpediente,
      idTipoDocumento: createDocumentoDto.idTipoDocumento,
      nombreArchivoOriginal: createDocumentoDto.nombreArchivoOriginal,
      rutaAlmacenamiento: createDocumentoDto.rutaAlmacenamiento,
      tipoMime: createDocumentoDto.tipoMime,
      pesoKb: createDocumentoDto.pesoKb,
      estado: createDocumentoDto.estado ?? EstadoDocumento.PENDIENTE_CARGA,
      observacionActual: createDocumentoDto.observacionActual,
    });

    return this.documentoRepository.save(documento);
  }

  findAll(): Promise<Documento[]> {
    const documentos = this.documentoRepository.find({
      relations: ['idExpediente', 'idTipoDocumento', 'idUsuarioRevisor'],
      order: { fechaUltimaCarga: 'DESC' }
    });
    return this.handleException(
      documentos,
      NotFoundException,
      'No se encontraron documentos'
    );
  }

  async findOne(idDocumento: number): Promise<Documento> {
    const documento = await this.documentoRepository.findOne({
      where: { idDocumento },
      relations: ['idExpediente', 'idTipoDocumento', 'idUsuarioRevisor']
    });
    return this.handleException(
      documento,
      NotFoundException,
      `Documento con ID ${idDocumento} no encontrado`
    );
  }

  async findByExpediente(idExpediente: number): Promise<Documento[]> {
    const documentos = await this.documentoRepository.find({
      where: { idExpediente },
      relations: ['idTipoDocumento', 'idUsuarioRevisor'],
      order: { fechaUltimaCarga: 'DESC' }
    });
    return this.handleException(
      documentos,
      NotFoundException,
      `No se encontraron documentos para el expediente ${idExpediente}`
    );
  }

  async findByEstado(estado: EstadoDocumento): Promise<Documento[]> {
    const documentos = await this.documentoRepository.find({
      where: { estado },
      relations: ['idExpediente', 'idTipoDocumento', 'idUsuarioRevisor'],
      order: { fechaUltimaCarga: 'DESC' }
    });
    return documentos;
  }

  async findPendientes(): Promise<Documento[]> {
    return this.findByEstado(EstadoDocumento.PENDIENTE_CARGA);
  }

  async findEnRevision(): Promise<Documento[]> {
    return this.findByEstado(EstadoDocumento.EN_REVISION);
  }

  async cambiarEstado(
    idDocumento: number, 
    nuevoEstado: EstadoDocumento, 
    idUsuarioRevisor?: number,
    observacion?: string
  ): Promise<Documento> {
    let documento = await this.documentoRepository.findOneBy({ idDocumento });
    documento = this.handleException(
      documento,
      NotFoundException,
      `Documento con ID ${idDocumento} no encontrado`
    );

    documento.estado = nuevoEstado;
    documento.fechaRevision = new Date();
    
    if (idUsuarioRevisor) {
      documento.idUsuarioRevisor = idUsuarioRevisor;
    }
    
    if (observacion) {
      documento.observacionActual = observacion;
    }

    return this.documentoRepository.save(documento);
  }

  async update(id: number, updateDocumentoDto: UpdateDocumentoDto): Promise<Documento> {
    let existingDocumento = await this.documentoRepository.findOneBy({ idDocumento: id });
    existingDocumento = this.handleException(
      existingDocumento,
      NotFoundException,
      `Documento con ID ${id} no encontrado`
    );

    // Si se está cargando un nuevo archivo, actualizar fecha
    if (updateDocumentoDto.rutaAlmacenamiento) {
      existingDocumento.fechaUltimaCarga = new Date();
    }

    Object.assign(existingDocumento, updateDocumentoDto);
    return this.documentoRepository.save(existingDocumento);
  }

  async remove(id: number) {
    let existingDocumento = await this.documentoRepository.findOneBy({ idDocumento: id });
    existingDocumento = this.handleException(
      existingDocumento,
      NotFoundException,
      `Documento con ID ${id} no encontrado`
    );
    return this.documentoRepository.remove(existingDocumento);
  }
}