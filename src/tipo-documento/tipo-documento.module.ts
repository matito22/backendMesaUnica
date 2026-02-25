import { Module } from '@nestjs/common';
import { TipoDocumentoService } from './tipo-documento.service';
import { TipoDocumentoController } from './tipo-documento.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TipoDocumento } from './entities/tipo-documento.entity';
import { SectorMunicipalModule } from 'src/sector-municipal/sector-municipal.module';
import { Type } from 'class-transformer';
import { TipoExpediente } from 'src/tipo-expediente/entities/tipo-expediente.entity';

@Module({
  imports: [TypeOrmModule.forFeature([TipoDocumento]),SectorMunicipalModule,TypeOrmModule.forFeature([TipoExpediente])],
  controllers: [TipoDocumentoController],
  providers: [TipoDocumentoService],
  exports: [TipoDocumentoService],
  
})
export class TipoDocumentoModule {}
