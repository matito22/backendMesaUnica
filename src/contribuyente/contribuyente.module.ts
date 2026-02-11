import { Module } from '@nestjs/common';
import { ContribuyenteService } from './contribuyente.service';
import { ContribuyenteController } from './contribuyente.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Contribuyente } from './entities/contribuyente.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Contribuyente])],
  controllers: [ContribuyenteController],
  providers: [ContribuyenteService],
  exports: [ContribuyenteService],
})
export class ContribuyenteModule {}
