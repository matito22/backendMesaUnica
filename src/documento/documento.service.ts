import { BadRequestException, ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { In, Not, Repository } from 'typeorm';
import { unlink } from 'fs/promises';
import { existsSync } from 'fs';
import { Documento } from './entities/documento.entity';
import { EstadoDocumento } from 'src/enum/estado-documento';
import { Expediente } from '../expediente/entities/expediente.entity';
import { TipoDocumento } from '../tipo-documento/entities/tipo-documento.entity';
import { SubirDocumentoDto } from './dto/subir-documento.dto';
import { RevisarDocumentoDto } from './dto/revisar-documento.dto';
import { UsuarioMunicipal } from 'src/usuario-municipal/entities/usuario-municipal.entity';
import { HistorialDocumento } from 'src/historial-documento/entities/historial-documento.entity';
import { ExpedienteService } from 'src/expediente/expediente.service';
import { RequisitoTipoExpediente } from 'src/requisito-tipo-expediente/entities/requisito-tipo-expediente.entity';

// Ciclo de vida de un documento:
// PENDIENTE_CARGA → CARGADO → APROBADO
//                         ↘ PENDIENTE_RESUBIDA → CARGADO → ...

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
    @InjectRepository(RequisitoTipoExpediente)
    private readonly requisitoRepository: Repository<RequisitoTipoExpediente>,

    private readonly expedienteService: ExpedienteService,
  ) {}



  // [S-21] Sube un archivo o reemplaza uno existente si está en estado permitido.
  // Solo permite resubida si el estado es PENDIENTE_CARGA o PENDIENTE_RESUBIDA.

  async subirArchivo(
    dto: SubirDocumentoDto,
    file: Express.Multer.File,
    idExpediente: number,
  ): Promise<Documento> {
    const expediente = await this.expedienteRepository.findOne({
      where: { idExpediente },
    });
    if (!expediente) throw new NotFoundException('Expediente no encontrado');

    const tipoDocumento = await this.tipoDocumentoRepository.findOne({
      where: { idTipoDocumento: dto.idTipoDocumento },
    });
    if (!tipoDocumento)
      throw new NotFoundException('Tipo de documento no encontrado');

    const documentoVigente = await this.documentoRepository.findOne({
      where: {
        expediente: { idExpediente },
        tipoDocumento: { idTipoDocumento: dto.idTipoDocumento },
        vigente: true,
      },
    });

    if (documentoVigente) {
      const estadosQuePermiteSubida = [
        EstadoDocumento.PENDIENTE_CARGA,
        EstadoDocumento.PENDIENTE_RESUBIDA,
      ];

      if (!estadosQuePermiteSubida.includes(documentoVigente.estado)) {
        throw new BadRequestException(
          `No se puede resubir el documento en estado "${documentoVigente.estado}". ` +
          `Solo se permite en: ${estadosQuePermiteSubida.join(', ')}`,
        );
      }

      // Si es PENDIENTE_CARGA, nunca tuvo archivo → actualizamos el mismo registro
      if (documentoVigente.estado === EstadoDocumento.PENDIENTE_CARGA) {
        documentoVigente.nombreArchivo      = file.originalname;
        documentoVigente.rutaAlmacenamiento = file.path;
        documentoVigente.tipoMime           = file.mimetype;
        documentoVigente.pesoKb             = Math.ceil(file.size / 1024);
        documentoVigente.estado             = EstadoDocumento.CARGADO;
        documentoVigente.fechaUltimaCarga   = new Date();
        documentoVigente.numeroVersion      = 1;

        await this.expedienteService.cambiarEstado({ idExpediente });
        return this.documentoRepository.save(documentoVigente);
      }

      // Si es PENDIENTE_RESUBIDA, ya tuvo archivo → versionamos
      documentoVigente.vigente = false;
      await this.documentoRepository.save(documentoVigente);

      const nuevo = this.documentoRepository.create({
        nombreArchivo: file.originalname,
        rutaAlmacenamiento: file.path,
        tipoMime: file.mimetype,
        pesoKb: Math.ceil(file.size / 1024),
        estado: EstadoDocumento.CARGADO,
        fechaUltimaCarga: new Date(),
        numeroVersion: documentoVigente.numeroVersion + 1,
        vigente: true,
        expediente,
        tipoDocumento,
      });

      await this.expedienteService.cambiarEstado({ idExpediente });
      return this.documentoRepository.save(nuevo);
    }

    // Sin documento existente → primera carga
    const nuevo = this.documentoRepository.create({
      nombreArchivo: file.originalname,
      rutaAlmacenamiento: file.path,
      tipoMime: file.mimetype,
      pesoKb: Math.ceil(file.size / 1024),
      estado: EstadoDocumento.CARGADO,
      fechaUltimaCarga: new Date(),
      numeroVersion: 1,
      vigente: true,
      expediente,
      tipoDocumento,
    });

    return this.documentoRepository.save(nuevo);
  }



    async revisarDocumentoBySlug(slug: string, dto: RevisarDocumentoDto, idUsuario: number): Promise<Documento> {
    const documento = await this.documentoRepository.findOne({ where: { slug } });
    if (!documento) throw new NotFoundException('Documento no encontrado');

    const estadoAnterior = documento.estado; // Guardamos el estado antes de cambiarlo para el historial

    const usuarioRevisor = await this.usuarioRepository.findOne({ where: { idUsuario } });

    documento.estado = dto.estado;
    documento.observacionActual = dto.observacion ?? null;
    documento.fechaRevision = new Date();
    documento.usuarioRevisor = usuarioRevisor;

    await this.documentoRepository.save(documento);

    // Registramos el cambio en el historial para auditoría (quién revisó, cuándo, qué decidió)
    const historial = this.historialRepository.create({
      idDocumento: documento.idDocumento,
      estadoAnterior,
      estadoNuevo: dto.estado,
      observacion: dto.observacion ?? undefined,
      usuarioActor: usuarioRevisor,
    });
    await this.historialRepository.save(historial);

    // Recalculamos el estado del expediente según el nuevo estado de sus documentos
    const doc = await this.documentoRepository.findOne({
      where: { idDocumento: documento.idDocumento },
      relations: ['expediente'],
    });
    if (!doc) throw new NotFoundException('Documento no encontrado');
    await this.expedienteService.cambiarEstado({ idExpediente: doc.expediente.idExpediente });

    return documento;
  }

  async obtenerRutaParaDescargaBySlug(slug: string): Promise<string> {
    const documento = await this.documentoRepository.findOne({ where: { slug } });
    if (!documento) throw new NotFoundException('Documento no encontrado');

    // Verificamos que el archivo físico exista, ya que podría haberse borrado del disco manualmente
    if (!documento.rutaAlmacenamiento || !existsSync(documento.rutaAlmacenamiento)) {
      throw new NotFoundException('El archivo físico no existe en el servidor');
    }

    return documento.rutaAlmacenamiento;
  }




  // [S-22] Devuelve los documentos de un expediente con tipo y revisor.
  async findByExpediente(idExpediente: number): Promise<Documento[]> {
    return this.documentoRepository.find({
      where: { expediente: { idExpediente } },
      relations: ['tipoDocumento', 'usuarioRevisor'],
      order: { fechaUltimaCarga: 'DESC' },
    });
  }

  // [S-23] Devuelve un documento con sus relaciones.
  async findOne(idDocumento: number): Promise<Documento> {
    const doc = await this.documentoRepository.findOne({
      where: { idDocumento },
      relations: ['expediente', 'tipoDocumento', 'usuarioRevisor'],
    });
    if (!doc) throw new NotFoundException('Documento no encontrado');
    return doc;
  }

  //Devuelve el documento con todas sus relaciones con slug en vez de id, para mostrar el detalle del documento.
  async findOneBySlug(slug: string): Promise<Documento> {
    const doc = await this.documentoRepository.findOne({
      where: { slug },
      relations: ['expediente', 'tipoDocumento', 'usuarioRevisor','tipoDocumento.idSectorResponsable'],
    });
    if (!doc) throw new NotFoundException('Documento no encontrado');
    return doc;
  }

  // [S-26] Elimina el documento de la DB y el archivo físico del servidor.
  async eliminar(idDocumento: number): Promise<void> {
    const documento = await this.findOne(idDocumento);
    await this.eliminarArchivoDisco(documento.rutaAlmacenamiento);
    await this.documentoRepository.remove(documento);
  }

  // Elimina el archivo del disco. Verifica existencia antes para evitar errores.
  private async eliminarArchivoDisco(ruta: string | null): Promise<void> {
    if (ruta && existsSync(ruta)) {
      try {
        await unlink(ruta);
      } catch {
        console.warn(`No se pudo eliminar el archivo: ${ruta}`);
      }
    }
  }

// Devuelve los tipos de documentos opcionales para este tipo de expediente, filtrando los que ya están agregados.
async getDocumentosOpcionales(slug: string): Promise<TipoDocumento[]> {
  const expediente = await this.expedienteRepository.findOne({
    where: { slug },
    relations: ['tipoExpediente'],
  });

  if (!expediente) throw new NotFoundException('El expediente no existe');

  const opcionales = await this.requisitoRepository.find({
    where: {
      tipoExpediente: { idTipoExpediente: expediente.tipoExpediente.idTipoExpediente },
      esObligatorio: false,
    },
    relations: ['tipoDocumento'],
  });

  return opcionales.map(r => r.tipoDocumento);
}

 
//Agrega un documento opcional a un expediente,creando el registro en la tabla Documento con estado PENDIENTE_CARGA.
async agregarDocumentoOpcional(slug: string, idTipoDocumento: number): Promise<Documento> {
  const expediente = await this.expedienteRepository.findOne({
    where: { slug },
    relations: ['tipoExpediente'],
  });

  if (!expediente) throw new NotFoundException('El expediente no existe');

 
  const yaExiste = await this.documentoRepository.findOne({
    where: {
      expediente: { idExpediente: expediente.idExpediente },
      tipoDocumento: { idTipoDocumento },
    },
  });

  if (yaExiste) throw new ConflictException('Este documento ya fue agregado al expediente');

  const requisito = await this.requisitoRepository.findOne({
    where: {
      tipoExpediente: { idTipoExpediente: expediente.tipoExpediente.idTipoExpediente },
      tipoDocumento: { idTipoDocumento },
      esObligatorio: false,
    },
    relations: ['tipoDocumento'],
  });

  if (!requisito) throw new BadRequestException('Este documento no es válido para este tipo de expediente');

  const documento = this.documentoRepository.create({
    expediente,
    tipoDocumento: requisito.tipoDocumento,
    estado: EstadoDocumento.PENDIENTE_CARGA,
    nombreArchivo: '',
    rutaAlmacenamiento: '',
  });

  return await this.documentoRepository.save(documento);
}

//Devuelve el historial de documentos de un expediente, para mostrar el detalle del documento.
async obtenerHistorialDocumentos(slug: string): Promise<Documento[]> {
  const documento = await this.documentoRepository.findOne({
    where: { slug },
    relations: ['expediente', 'tipoDocumento'],
  });
  if (!documento) throw new NotFoundException('Documento no encontrado');

  return this.documentoRepository.find({
    where: {
      expediente: { idExpediente: documento.expediente.idExpediente },
      tipoDocumento: { idTipoDocumento: documento.tipoDocumento.idTipoDocumento },
      vigente: false, 
    },
    relations: ['tipoDocumento', 'usuarioRevisor'],
    order: { numeroVersion: 'DESC' },
  });
}
//Se corrige un documento
async solicitarCorreccion(slug: string,observacion: string,idUsuario: number,file?: Express.Multer.File,): Promise<Documento> {
  const documento = await this.documentoRepository.findOne({
    where: { slug },
    relations: ['expediente', 'tipoDocumento'],
  });
  if (!documento) throw new NotFoundException('Documento no encontrado');

  const estadoAnterior = documento.estado;
  const usuarioRevisor = await this.usuarioRepository.findOne({ where: { idUsuario } });


  documento.estado = EstadoDocumento.PENDIENTE_RESUBIDA;
  documento.observacionActual = observacion;
  documento.fechaRevision = new Date();
  documento.usuarioRevisor = usuarioRevisor;

  if (file) {
    documento.nombreArchivoCorreccion = file.originalname;
    documento.rutaCorreccion = file.path;
    documento.tipoMimeCorreccion = file.mimetype;
    documento.pesoKbCorreccion = Math.ceil(file.size / 1024);
  }

  await this.documentoRepository.save(documento);


  const historial = this.historialRepository.create({
    idDocumento: documento.idDocumento,
    estadoAnterior,
    estadoNuevo: EstadoDocumento.PENDIENTE_RESUBIDA,
    observacion,
    usuarioActor: usuarioRevisor,
  });
  await this.historialRepository.save(historial);

 
  await this.expedienteService.cambiarEstado({
    idExpediente: documento.expediente.idExpediente,
  });

  return documento;
}
}
