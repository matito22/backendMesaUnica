import { Module } from '@nestjs/common';
import { ExpedienteService } from './expediente.service';
import { ExpedienteController } from './expediente.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Expediente } from './entities/expediente.entity';
import { Contribuyente } from '../contribuyente/entities/contribuyente.entity';
import { TipoExpediente } from '../tipo-expediente/entities/tipo-expediente.entity';

@Module({
   imports: [TypeOrmModule.forFeature([Expediente,Contribuyente,TipoExpediente])],
  controllers: [ExpedienteController],
  providers: [ExpedienteService],
  exports: [ExpedienteService],
})
export class ExpedienteModule {}
