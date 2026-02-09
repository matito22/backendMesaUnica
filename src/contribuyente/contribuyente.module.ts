import { Module } from '@nestjs/common';
import { ContribuyenteService } from './contribuyente.service';
import { ContribuyenteController } from './contribuyente.controller';

@Module({
  controllers: [ContribuyenteController],
  providers: [ContribuyenteService],
})
export class ContribuyenteModule {}
