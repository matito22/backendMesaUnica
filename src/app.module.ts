import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule } from '@nestjs/config';
import { AppConfigService } from './config/app.config.service';
import { AppConfigModule } from './config/app.config.module';
import { AuthModule } from './auth/auth.module';
import { APP_GUARD } from '@nestjs/core';
import { JwtAuthGuard } from './auth/jwt-auth.guard';
import { UsuarioMunicipalModule } from './usuario-municipal/usuario-municipal.module';
import { SectorMunicipalModule } from './sector-municipal/sector-municipal.module';
import { TipoDocumentoModule } from './tipo-documento/tipo-documento.module';
import { HistorialDocumentoModule } from './historial-documento/historial-documento.module';
import { DocumentoModule } from './documento/documento.module';
import { ContribuyenteModule } from './contribuyente/contribuyente.module';
import { ExpedienteModule } from './expediente/expediente.module';
import { MensajeModule } from './mensaje/mensaje.module';

@Module({
  imports: [
   ConfigModule.forRoot({isGlobal: true}),AppConfigModule , TypeOrmModule.forRootAsync({
    imports: [AppConfigModule],
    inject: [AppConfigService],
    useFactory: (configService: AppConfigService) => ({
      ...configService.getDatabaseConfig(),
    }),
   }
   ), AuthModule
    ,UsuarioMunicipalModule
    ,SectorMunicipalModule
    ,TipoDocumentoModule
    ,HistorialDocumentoModule
    ,DocumentoModule
    ,ContribuyenteModule
    ,ExpedienteModule
    ,MensajeModule
  ],
  controllers: [AppController],
  providers: [AppService,AppConfigService,
    {
      provide: APP_GUARD,
      useClass: JwtAuthGuard,
    }
  ],
  
})
export class AppModule {}
