// src/documento/documento.service.ts
import { BadRequestException,Injectable, NotFoundException,} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { unlink } from 'fs/promises';
import { existsSync } from 'fs';
import { join } from 'path';
import { Documento } from './entities/documento.entity';
import { EstadoDocumento } from 'src/enum/estado-documento';
import { Expediente } from '../expediente/entities/expediente.entity';
import { TipoDocumento } from '../tipo-documento/entities/tipo-documento.entity';
import { SubirDocumentoDto } from './dto/subir-documento.dto';
import { RevisarDocumentoDto } from './dto/revisar-documento.dto';

@Injectable()
export class DocumentoService {
  constructor(
    @InjectRepository(Documento)
    private readonly documentoRepository: Repository<Documento>,

    @InjectRepository(Expediente)
    private readonly expedienteRepository: Repository<Expediente>,

    @InjectRepository(TipoDocumento)
    private readonly tipoDocumentoRepository: Repository<TipoDocumento>,
  ) {}

  // ─── Subida / Reemplazo ──────────────────────────────────────────────────────
async subirArchivo(dto: SubirDocumentoDto, file: Express.Multer.File): Promise<Documento> {


  const expediente = await this.expedienteRepository.findOne({
    where: { idExpediente: dto.idExpediente },
  });
  if (!expediente) throw new NotFoundException('Expediente no encontrado');

  const tipoDocumento = await this.tipoDocumentoRepository.findOne({
    where: { idTipoDocumento: dto.idTipoDocumento },
  });
  if (!tipoDocumento) throw new NotFoundException('Tipo de documento no encontrado');

  const existente = await this.documentoRepository.findOne({
    where: {
      expediente: { idExpediente: dto.idExpediente },
      tipoDocumento: { idTipoDocumento: dto.idTipoDocumento },
    },
  });

  if (existente) {
    const estadosQuePermiteResubida = [
      EstadoDocumento.PENDIENTE_CARGA,
      EstadoDocumento.PENDIENTE_RESUBIDA,
    ];

    if (!estadosQuePermiteResubida.includes(existente.estado)) {
      throw new BadRequestException(
        `No se puede resubir el documento en estado "${existente.estado}". ` +
        `Solo se permite en: ${estadosQuePermiteResubida.join(', ')}`,
      );
    }

    //Si esta en pendiente_resubida, eliminar archivo anterior del disco antes de guardar el nuevo
    await this.eliminarArchivoDisco(existente.rutaAlmacenamiento);

    existente.nombreArchivo      = file.originalname;
    existente.rutaAlmacenamiento = file.path;
    existente.tipoMime           = file.mimetype;
    existente.pesoKb             = Math.ceil(file.size / 1024);
    existente.estado             = EstadoDocumento.CARGADO;
    existente.fechaUltimaCarga   = new Date();
    existente.observacionActual  = null; // ✅ ver fix en entidad abajo

    return this.documentoRepository.save(existente);
  }

  // ✅ expediente y tipoDocumento ya están definidas arriba
  const nuevo = this.documentoRepository.create({
    nombreArchivo: file.originalname,
    rutaAlmacenamiento: file.path,
    tipoMime: file.mimetype,
    pesoKb: Math.ceil(file.size / 1024),
    estado: EstadoDocumento.CARGADO,
    fechaUltimaCarga: new Date(),
    expediente,
    tipoDocumento,
  });

  return this.documentoRepository.save(nuevo);
}


  // ─── Revisión ────────────────────────────────────────────────────────────────
// Estado al revisar
async revisarDocumento(
  idDocumento: number,
  idUsuarioRevisor: number,
  dto: RevisarDocumentoDto,
): Promise<Documento> {
  const documento = await this.documentoRepository.findOne({
    where: { idDocumento },
    relations: ['expediente', 'tipoDocumento'],
  });

  if (!documento) throw new NotFoundException('Documento no encontrado');

  // Solo se pueden revisar documentos que ya fueron cargados o están en revisión
  const estadosRevisables = [
    EstadoDocumento.CARGADO,
    EstadoDocumento.EN_REVISION,
  ];

  if (!estadosRevisables.includes(documento.estado)) {
    throw new BadRequestException(
      `No se puede revisar un documento en estado "${documento.estado}". ` +
      `Estados válidos: ${estadosRevisables.join(', ')}`,
    );
  }

  documento.estado = dto.estado; // APROBADO o PENDIENTE_RESUBIDA
  documento.observacionActual = dto.observacion ?? null;
  documento.fechaRevision = new Date();
  documento.usuarioRevisor = { idUsuarioMunicipal: idUsuarioRevisor } as any;

  return this.documentoRepository.save(documento);
}

  // ─── Descarga ────────────────────────────────────────────────────────────────

  async obtenerRutaParaDescarga(idDocumento: number): Promise<string> {
    const documento = await this.documentoRepository.findOne({
      where: { idDocumento },
    });

    if (!documento) throw new NotFoundException('Documento no encontrado');

    if (!documento.rutaAlmacenamiento || !existsSync(documento.rutaAlmacenamiento)) {
      throw new NotFoundException('El archivo físico no existe en el servidor');
    }

    return documento.rutaAlmacenamiento;
  }

  // ─── Consulta ────────────────────────────────────────────────────────────────

  async findByExpediente(idExpediente: number): Promise<Documento[]> {
    return this.documentoRepository.find({
      where: { expediente: { idExpediente } },
      relations: ['tipoDocumento', 'usuarioRevisor'],
      order: { fechaUltimaCarga: 'DESC' },
    });
  }

  async findOne(idDocumento: number): Promise<Documento> {
    const doc = await this.documentoRepository.findOne({
      where: { idDocumento },
      relations: ['expediente', 'tipoDocumento', 'usuarioRevisor'],
    });
    if (!doc) throw new NotFoundException('Documento no encontrado');
    return doc;
  }

  // ─── Eliminación ─────────────────────────────────────────────────────────────

  async eliminar(idDocumento: number): Promise<void> {
    const documento = await this.findOne(idDocumento);
    await this.eliminarArchivoDisco(documento.rutaAlmacenamiento);
    await this.documentoRepository.remove(documento);
  }

  // ─── Helpers privados ────────────────────────────────────────────────────────

  private async eliminarArchivoDisco(ruta: string | null): Promise<void> {
    //Verificamos si existe el archivo antes de intentar eliminarlo para evitar errores
    if (ruta && existsSync(ruta)) {
      try {
        await unlink(ruta);
      } catch {
        // No lanzar error si el archivo ya no existe; solo loguear
        console.warn(`No se pudo eliminar el archivo: ${ruta}`);
      }
    }
  }
}