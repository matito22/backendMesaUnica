import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { RequisitoTipoExpedienteService } from './requisito-tipo-expediente.service';
import { RequisitoTipoExpedienteController } from './requisito-tipo-expediente.controller';
import { RequisitoTipoExpediente } from './entities/requisito-tipo-expediente.entity';

@Module({
  imports: [TypeOrmModule.forFeature([RequisitoTipoExpediente])],
  controllers: [RequisitoTipoExpedienteController],
  providers: [RequisitoTipoExpedienteService],
  exports: [
    RequisitoTipoExpedienteService,
  ],
})
export class RequisitoTipoExpedienteModule {}