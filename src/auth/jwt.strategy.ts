
import { ExtractJwt, Strategy } from 'passport-jwt';
import { PassportStrategy } from '@nestjs/passport';
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';


@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {

  constructor(private configService: ConfigService) {

    
    super({
      jwtFromRequest: ExtractJwt.fromExtractors([
        (req) => {
          

          if (req && req.cookies) {
            return req.cookies['access_token'];
          }

          return null;
        },
      ]),
      ignoreExpiration: false,
      secretOrKey: configService.get<string>('JWT_SECRET')!,
    });
  }

  
  //Este validate es el que chequea si el jwt secret es valido y si no expiro y devuelve el usuario que se guarda en req.user
  async validate(payload: any) {

    return { userId: payload.sub, username: payload.username,role:payload.role,idSector:payload.idSector};
  }

}