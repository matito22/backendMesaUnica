import { Module } from '@nestjs/common';
import { HistorialDocumentoService } from './historial-documento.service';
import { HistorialDocumentoController } from './historial-documento.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { HistorialDocumento } from './entities/historial-documento.entity';

@Module({
  imports: [TypeOrmModule.forFeature([HistorialDocumento])],
  controllers: [HistorialDocumentoController],
  providers: [HistorialDocumentoService],
  exports: [HistorialDocumentoService],
})
export class HistorialDocumentoModule {}
