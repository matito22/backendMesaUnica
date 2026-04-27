import { forwardRef, Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { MulterModule } from '@nestjs/platform-express';
import { DocumentoController } from './documento.controller';
import { DocumentoService } from './documento.service';
import { Documento } from './entities/documento.entity';
import { Expediente } from 'src/expediente/entities/expediente.entity';
import { TipoDocumento } from 'src/tipo-documento/entities/tipo-documento.entity';
import { UsuarioMunicipal } from 'src/usuario-municipal/entities/usuario-municipal.entity';
import { HistorialDocumento } from 'src/historial-documento/entities/historial-documento.entity';
import { ExpedienteModule } from 'src/expediente/expediente.module';
import { TasksModule } from 'src/tasks/tasks.module';
import { RequisitoTipoExpediente } from 'src/requisito-tipo-expediente/entities/requisito-tipo-expediente.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Documento,
      Expediente,
      TipoDocumento,
      UsuarioMunicipal,
      HistorialDocumento,
      RequisitoTipoExpediente,
      
    ]),
    forwardRef(() => ExpedienteModule),  // Módulo, no entidad
    MulterModule.register({ dest: './uploads' }),
  ],
  controllers: [DocumentoController],
  providers: [DocumentoService],
  exports: [DocumentoService],
})
export class DocumentoModule {}