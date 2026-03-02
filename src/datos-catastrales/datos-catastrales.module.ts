import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DatosCatastrales } from './entities/datos-catastrales.entity';
import { DatosCatastralesService } from './datos-catastrales.service';
import { DatosCatastralesController } from './datos-catastrales.controller';

@Module({
  imports: [TypeOrmModule.forFeature([DatosCatastrales])],
  providers: [DatosCatastralesService],
  controllers: [DatosCatastralesController],
  exports: [DatosCatastralesService],
})
export class DatosCatastralesModule {}
