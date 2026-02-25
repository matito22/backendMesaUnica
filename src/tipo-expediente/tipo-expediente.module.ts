import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TipoExpedienteService } from './tipo-expediente.service';
import { TipoExpedienteController } from './tipo-expediente.controller';
import { TipoExpediente } from './entities/tipo-expediente.entity';

import { SectorMunicipal } from '../sector-municipal/entities/sector-municipal.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([TipoExpediente,SectorMunicipal]),
  ],
  controllers: [TipoExpedienteController],
  providers: [TipoExpedienteService],
  exports: [
    TipoExpedienteService,
  ],
})
export class TipoExpedienteModule {}