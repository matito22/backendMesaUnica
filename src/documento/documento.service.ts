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
import { UsuarioMunicipal } from 'src/usuario-municipal/entities/usuario-municipal.entity';
import { HistorialDocumento } from 'src/historial-documento/entities/historial-documento.entity';

@Injectable()
export class DocumentoService {
  constructor(
    @InjectRepository(Documento)
    private readonly documentoRepository: Repository<Documento>,

    @InjectRepository(Expediente)
    private readonly expedienteRepository: Repository<Expediente>,

    @InjectRepository(TipoDocumento)
    private readonly tipoDocumentoRepository: Repository<TipoDocumento>,

    @InjectRepository(UsuarioMunicipal)
    private readonly usuarioRepository: Repository<UsuarioMunicipal>,

    @InjectRepository(HistorialDocumento)
    private readonly historialRepository: Repository<HistorialDocumento>,
  ) {}

  //SUBIMOS UN ARCHIVO O REEMPLAZAMOS UN EXISTENTE EN CASO DE QUE CUMPLA EL CRITERIO DE VALIDACION
async subirArchivo(dto: SubirDocumentoDto, file: Express.Multer.File): Promise<Documento> {

  const expediente = await this.expedienteRepository.findOne({
    where: { idExpediente: dto.idExpediente },
  });
  if (!expediente) throw new NotFoundException('Expediente no encontrado');

  //VALIDAMOS QUE EXISTA EL TIPO DE DOCUMENTO
  const tipoDocumento = await this.tipoDocumentoRepository.findOne({
    where: { idTipoDocumento: dto.idTipoDocumento },
  });
  if (!tipoDocumento) throw new NotFoundException('Tipo de documento no encontrado');

  //VALIDAMOS QUE NO EXISTA YA EL DOCUMENTO
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

  //SI EXISTE PERO SU ESTADO NO SE ENCUENTRA EN PENDIENTE CARGA O PENDIENTE RESUBIDA, LANZAMOS UNA EXCEPCION
    if (!estadosQuePermiteResubida.includes(existente.estado)) {
      throw new BadRequestException(
        `No se puede resubir el documento en estado "${existente.estado}". ` +
        `Solo se permite en: ${estadosQuePermiteResubida.join(', ')}`,
      );
    }

    //SI ESTA PENDIENTE RESUBIDA SE ELIMINA EL ARCHIVO ANTERIOR DEL DISCO
    await this.eliminarArchivoDisco(existente.rutaAlmacenamiento);

    existente.nombreArchivo      = file.originalname;
    existente.rutaAlmacenamiento = file.path;
    existente.tipoMime           = file.mimetype;
    existente.pesoKb             = Math.ceil(file.size / 1024);
    existente.estado             = EstadoDocumento.CARGADO;
    existente.fechaUltimaCarga   = new Date();
    existente.observacionActual  = null; 

    return this.documentoRepository.save(existente);
  }

  // expediente y tipoDocumento ya están definidas arriba
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
// documento.service.ts
async revisarDocumento(idDocumento: number, dto: RevisarDocumentoDto, idUsuario: number): Promise<Documento> {

  const documento = await this.documentoRepository.findOne({
    where: { idDocumento }
  });
  if (!documento) throw new NotFoundException('Documento no encontrado');

  const estadoAnterior = documento.estado;

    // usuarioRevisor es relación, no columna plana
  const usuarioRevisor = await this.usuarioRepository.findOne({
    where: { idUsuario }
  });

  //Se actualiza el documento
  documento.estado = dto.estado;
  documento.observacionActual = dto.observacion ?? null;
  documento.fechaRevision = new Date();
  documento.usuarioRevisor = usuarioRevisor;

  await this.documentoRepository.save(documento);

  //Guardamos los cambios de la revision en el historial de documentos
  const historial = this.historialRepository.create({
    idDocumento: documento.idDocumento,
    estadoAnterior,
    estadoNuevo: dto.estado,
    observacion: dto.observacion ?? undefined,
    usuarioActor: usuarioRevisor,
  });
  await this.historialRepository.save(historial);

  return documento;
}

  // ─── Descarga ────────────────────────────────────────────────────────────────
  async obtenerRutaParaDescarga(idDocumento: number): Promise<string> {
    const documento = await this.documentoRepository.findOne({
      where: { idDocumento },
    });
    if (!documento) throw new NotFoundException('Documento no encontrado');

    //Se valida que exista la ruta de almacenamiento y tambien que exista el documento fisico en donde los guardamos. Ya que el archivo puede haber sido eliminado
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

  private async eliminarArchivoDisco(ruta: string | null): Promise<void> {
    //Verificamos si existe el archivo antes de intentar eliminarlo para evitar errores
    if (ruta && existsSync(ruta)) {
      try {
        //Eliminamos el archivo
        await unlink(ruta);
      } catch {
        console.warn(`No se pudo eliminar el archivo: ${ruta}`);
      }
    }
  }
}