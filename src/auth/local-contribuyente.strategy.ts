import { Strategy } from 'passport-local';
import { PassportStrategy } from '@nestjs/passport';
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { AuthService } from './auth.service';

@Injectable()
export class LocalContribuyenteStrategy extends PassportStrategy(Strategy, 'local-contribuyente') {
  constructor(private authService: AuthService) {
    super({ usernameField: 'dni' });
  }

  async validate(dni: string, password: string): Promise<any> {

    const contribuyente = await this.authService.validateContribuyente(dni, password);
    if (!contribuyente) {
      throw new UnauthorizedException();
    }
    return contribuyente;
  }
}