import { Module } from '@nestjs/common';
import { UsuarioMunicipalService } from './usuario-municipal.service';
import { UsuarioMunicipalController } from './usuario-municipal.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UsuarioMunicipal } from './entities/usuario-municipal.entity';
import { SectorMunicipal } from '../sector-municipal/entities/sector-municipal.entity';

@Module({
  imports: [TypeOrmModule.forFeature([UsuarioMunicipal,SectorMunicipal])],
  controllers: [UsuarioMunicipalController],
  providers: [UsuarioMunicipalService],
  exports: [UsuarioMunicipalService],
})
export class UsuarioMunicipalModule {}
