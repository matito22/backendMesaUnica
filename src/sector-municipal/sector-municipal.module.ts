import { Module } from '@nestjs/common';
import { SectorMunicipalService } from './sector-municipal.service';
import { SectorMunicipalController } from './sector-municipal.controller';
import { Type } from 'class-transformer';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SectorMunicipal } from './entities/sector-municipal.entity';

@Module({
  imports: [TypeOrmModule.forFeature([SectorMunicipal])],
  controllers: [SectorMunicipalController],
  providers: [SectorMunicipalService],
  exports: [SectorMunicipalService],
})
export class SectorMunicipalModule {}
