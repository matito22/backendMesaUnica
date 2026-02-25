import { Strategy } from 'passport-local';
import { PassportStrategy } from '@nestjs/passport';
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { AuthService } from './auth.service';

@Injectable()
export class LocalContribuyenteStrategy extends PassportStrategy(Strategy, 'local-contribuyente') {
  constructor(private authService: AuthService) {
    super({ usernameField: 'email' });
  }

  async validate(email: string, password: string): Promise<any> {
    console.log('Validating contribuyente with email:', email); // Verificar el email recibido  
    const contribuyente = await this.authService.validateContribuyente(email, password);
    if (!contribuyente) {
      throw new UnauthorizedException();
    }
    return contribuyente;
  }
}