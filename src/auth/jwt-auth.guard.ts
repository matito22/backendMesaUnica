
import { ExecutionContext, Injectable } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { AuthGuard } from '@nestjs/passport';
import { IS_PUBLIC_KEY } from './public-key';

@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {

    constructor(private reflector: Reflector) {
    super();
  }

  canActivate(context: ExecutionContext) {//context es la petición que se está ejecutando, la request actual
    const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [//Revisa si la ruta está marcada como pública
      context.getHandler(),//Obtenemos el handler del contexto, es decir el controlador que se está ejecutando, por ej: auth.controller.ts cuando ejecuta getProfile, devuelve el getProfile del controlador
      context.getClass(),//Devuelve el controlador que se está ejecutando, por ej: auth.controller.ts
    ]);
    if (isPublic) {
      return true;//Permite pasar sin token si es pública
    }
    return super.canActivate(context);//Si no es pública, se ejecuta el canActivate de la AuthGuard y va a jwt.strategy.ts, valida el token y devuelve el usuario
  }
}
