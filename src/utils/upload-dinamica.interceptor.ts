// src/documento/interceptors/upload-dinamico.interceptor.ts
import { CallHandler, ExecutionContext, Injectable, NestInterceptor } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { crearMulterConfig, PerfilSubida } from '../config/multer.config';
import { ExpedienteService } from 'src/expediente/expediente.service';

const PERFIL_POR_SECTOR: Record<number, PerfilSubida> = {
  4: 'EDITABLE', // Planeamiento
  7: 'EDITABLE', // Obras Particulares
  
};


//Lo utilizamos para definir el tipo de archivo que se puede subir en cada tipo de expediente, ya que los sectores lo eligieron asi
@Injectable()
export class UploadDinamicoInterceptor implements NestInterceptor {

  constructor(private readonly expedienteService: ExpedienteService) {}

  async intercept(context: ExecutionContext, next: CallHandler) {
    
    const req = context.switchToHttp().getRequest();

    const idExpediente = Number(req.params.idExpediente);
    const expediente = await this.expedienteService.findOne(idExpediente);

    const idSector: number = expediente?.tipoExpediente.sectorResponsable.idSector;
    const perfil: PerfilSubida = PERFIL_POR_SECTOR[idSector] ?? 'SOLO_LECTURA';

    const interceptor = new (FileInterceptor('archivo', crearMulterConfig(perfil)))();
    return interceptor.intercept(context, next);
  }
}