import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';

import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { LocalStrategy } from './local.strategy';
import { JwtStrategy } from './jwt.strategy';
import { LocalContribuyenteStrategy } from './local-contribuyente.strategy';
import { LocalAuthContribuyenteGuard } from './local-auth-contribuyente.guard';
import { UsuarioMunicipalModule } from '../usuario-municipal/usuario-municipal.module';
import { SectorMunicipalModule } from 'src/sector-municipal/sector-municipal.module';
import { ContribuyenteModule } from 'src/contribuyente/contribuyente.module';
import { MailModule } from 'src/mail/mail.module';




@Module({
  
  imports: [UsuarioMunicipalModule,PassportModule,SectorMunicipalModule,ContribuyenteModule,MailModule,
    JwtModule.register({
      secret: process.env.JWT_SECRET,
      signOptions: { expiresIn: '60m' },
    })
  ],
  controllers: [AuthController],
  providers: [AuthService,LocalStrategy,JwtStrategy, LocalContribuyenteStrategy, LocalAuthContribuyenteGuard],
  exports: [AuthService],
})
export class AuthModule {}
