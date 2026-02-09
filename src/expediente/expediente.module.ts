import { Module } from '@nestjs/common';
import { ExpedienteService } from './expediente.service';
import { ExpedienteController } from './expediente.controller';

@Module({
  controllers: [ExpedienteController],
  providers: [ExpedienteService],
})
export class ExpedienteModule {}
