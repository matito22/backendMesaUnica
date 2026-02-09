import { Module } from '@nestjs/common';
import { HistorialDocumentoService } from './historial-documento.service';
import { HistorialDocumentoController } from './historial-documento.controller';

@Module({
  controllers: [HistorialDocumentoController],
  providers: [HistorialDocumentoService],
})
export class HistorialDocumentoModule {}
