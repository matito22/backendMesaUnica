import { Module } from '@nestjs/common';
import { TipoDocumentoService } from './tipo-documento.service';
import { TipoDocumentoController } from './tipo-documento.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TipoDocumento } from './entities/tipo-documento.entity';
import { SectorMunicipalModule } from 'src/sector-municipal/sector-municipal.module';

@Module({
  imports: [TypeOrmModule.forFeature([TipoDocumento]),SectorMunicipalModule],
  controllers: [TipoDocumentoController],
  providers: [TipoDocumentoService],
  exports: [TipoDocumentoService],
  
})
export class TipoDocumentoModule {}
