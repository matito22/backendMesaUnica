import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';

import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { LocalStrategy } from './local.strategy';
import { JwtStrategy } from './jwt.strategy';
import { UsuarioMunicipalModule } from '../usuario-municipal/usuario-municipal.module';
import { SectorMunicipalModule } from 'src/sector-municipal/sector-municipal.module';




@Module({
  
  imports: [UsuarioMunicipalModule,PassportModule,SectorMunicipalModule,
    JwtModule.register({
      secret: process.env.JWT_SECRET,
      signOptions: { expiresIn: '60m' },
    })
  ],
  controllers: [AuthController],
  providers: [AuthService,LocalStrategy,JwtStrategy],
  exports: [AuthService],
})
export class AuthModule {}
