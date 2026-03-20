import { forwardRef, Module } from '@nestjs/common';
import { ExpedienteService } from './expediente.service';
import { ExpedienteController } from './expediente.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Expediente } from './entities/expediente.entity';
import { Contribuyente } from '../contribuyente/entities/contribuyente.entity';
import { TipoExpediente } from '../tipo-expediente/entities/tipo-expediente.entity';
import { DatosCatastrales } from '../datos-catastrales/entities/datos-catastrales.entity';
import { SectorMunicipal } from '../sector-municipal/entities/sector-municipal.entity';
import { RequisitoTipoExpediente } from 'src/requisito-tipo-expediente/entities/requisito-tipo-expediente.entity';
import { Documento } from 'src/documento/entities/documento.entity';
import { DocumentoModule } from 'src/documento/documento.module';

@Module({
  imports: [TypeOrmModule.forFeature([Expediente,Contribuyente,TipoExpediente,DatosCatastrales,SectorMunicipal,RequisitoTipoExpediente]),
 forwardRef(() => DocumentoModule),  // Módulo, no entidad
  ],
  controllers: [ExpedienteController],
  providers: [ExpedienteService],
  exports: [ExpedienteService],
})
export class ExpedienteModule {}
