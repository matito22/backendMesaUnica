import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { InjectRepository } from '@nestjs/typeorm';
import { Documento } from '../documento/entities/documento.entity';
import { EstadoExpediente } from '../enum/estado-expediente';
import { Expediente } from '../expediente/entities/expediente.entity';
import { LessThanOrEqual, Repository } from 'typeorm';
import { isAbsolute, join } from 'path';
import * as fs from 'fs/promises';

@Injectable()
export class TasksService {
  constructor( 
    @InjectRepository(Expediente)
    private readonly expedienteRepository: Repository<Expediente>,

    @InjectRepository(Documento)
    private readonly documentoRepository: Repository<Documento>,

  ) {
   
  }

  private readonly logger = new Logger(TasksService.name);


@Cron('0 0 1 * *')//Se ejecuta el primer dia del mes a las 00:00
async listarExpedientesFinalizadosYEliminarDocumentos() {
  const fechaLimite = new Date();
  fechaLimite.setMonth(fechaLimite.getMonth() - 3);

  const expedientes = await this.expedienteRepository
    .createQueryBuilder('expediente')
    .leftJoinAndSelect('expediente.documentos', 'documento')
    .where('expediente.estado = :estado', { estado: EstadoExpediente.FINALIZADO })
    .andWhere('expediente.fechaFinalizacion <= :fechaLimite', { fechaLimite })
    .getMany();

  this.logger.debug(`📂 Expedientes encontrados: ${expedientes.length}`);

  for (const exp of expedientes) {
   for (const doc of exp.documentos ?? []) {
  if (!doc.rutaAlmacenamiento) {
    this.logger.warn(`⚠️ Documento ${doc.idDocumento} sin ruta de almacenamiento`);
    continue;
  }

  try {
    const storageRoot = process.env.STORAGE_PATH ?? join(process.cwd(), 'uploads');
    const filePath = isAbsolute(doc.rutaAlmacenamiento)
      ? doc.rutaAlmacenamiento
      : join(storageRoot, doc.rutaAlmacenamiento);

    // 1. Intentar borrar el archivo físico
    await fs.unlink(filePath);
    this.logger.debug(`🗑️ Archivo eliminado: ${filePath}`);

  } catch (err: any) {
    if (err.code === 'ENOENT') {
      // El archivo ya no existe físicamente, igual hay que limpiar la DB
      this.logger.warn(`⚠️ Archivo no encontrado (ya fue eliminado?): ${doc.rutaAlmacenamiento}`);
    } else {
      this.logger.error(`❌ Error al eliminar archivo ${doc.rutaAlmacenamiento}: ${err.message}`);
      continue; // Si es otro error, no eliminar el registro de DB
    }
  }

  // 2. Eliminar el registro de la DB (tanto si el archivo existía como si ya no)
  try {
    await this.documentoRepository.delete(doc.idDocumento);
    this.logger.debug(`🗑️ Documento ${doc.idDocumento} eliminado de la DB`);
  } catch (err: any) {
    this.logger.error(`❌ Error al eliminar documento ${doc.idDocumento} de la DB: ${err.message}`);
  }
}
}
  }}

