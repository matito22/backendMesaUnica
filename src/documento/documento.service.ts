import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateDocumentoDto } from './dto/create-documento.dto';
import { UpdateDocumentoDto } from './dto/update-documento.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Documento } from './entities/documento.entity';
import { HandleService } from '../utils/handle.service';
import { EstadoDocumento } from 'src/enum/estado-documento';
import * as path from 'path';

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
      nombreArchivo: createDocumentoDto.nombreArchivo,
      rutaAlmacenamiento: createDocumentoDto.rutaAlmacenamiento,
      tipoMime: createDocumentoDto.tipoMime,
      pesoKb: createDocumentoDto.pesoKb,
      estado: createDocumentoDto.estado ?? EstadoDocumento.PENDIENTE_CARGA,
      observacionActual: createDocumentoDto.observacionActual,
    });

    if (createDocumentoDto.idExpediente) {
      (documento as any).expediente = { idExpediente: createDocumentoDto.idExpediente };
    }

    if (createDocumentoDto.idTipoDocumento) {
      (documento as any).tipoDocumento = { idTipoDocumento: createDocumentoDto.idTipoDocumento };
    }

    return this.documentoRepository.save(documento);
  }

  // Crea un Documento a partir de un archivo subido por Multer
  async createFromUpload(
    file: any,
    meta: { idExpediente?: number; idUsuario?: number; idTipoDocumento?: number },
  ): Promise<Documento> {
    const documento = this.documentoRepository.create();

    documento.nombreArchivo = file.originalname;
    documento.rutaAlmacenamiento = path.join('uploads', 'documentos', file.filename);
    documento.tipoMime = file.mimetype;
    documento.pesoKb = Math.round(file.size / 1024);
    documento.estado = EstadoDocumento.PENDIENTE_CARGA;
    documento.fechaUltimaCarga = new Date();

    if (meta.idExpediente) {
      (documento as any).expediente = { idExpediente: meta.idExpediente };
    }

    if (meta.idTipoDocumento) {
      (documento as any).tipoDocumento = { idTipoDocumento: meta.idTipoDocumento };
    }

    if (meta.idUsuario) {
      (documento as any).usuarioRevisor = { idUsuario: meta.idUsuario };
    }

    return this.documentoRepository.save(documento);
  }

async findAll(): Promise<Documento[]> {
    return this.documentoRepository.find({
        relations: ['expediente', 'tipoDocumento', 'usuarioRevisor'],
        order: { fechaUltimaCarga: 'DESC' }
    });
    // No hay nada que verificar: [] es una respuesta válida
}



async findByExpediente(idExpediente: number): Promise<Documento[]> {
    const documentos = await this.documentoRepository.find({
        where: { expediente: { idExpediente } },
        relations: ['tipoDocumento', 'usuarioRevisor'],
    });
    // Solo si tiene sentido de negocio lanzar error cuando no hay docs:
    if (documentos.length === 0) {
        throw new NotFoundException(`No hay documentos para el expediente ${idExpediente}`);
    }
    return documentos;
}


  async findByEstado(estado: EstadoDocumento): Promise<Documento[]> {
    const documentos = await this.documentoRepository.find({
      where: { estado },
      relations: ['expediente', 'tipoDocumento', 'usuarioRevisor'],
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
      (documento as any).usuarioRevisor = { idUsuario: idUsuarioRevisor };
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