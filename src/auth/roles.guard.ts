import { Injectable, CanActivate, ExecutionContext, ForbiddenException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';

import { HandleService } from '../utils/handle.service';
import { RolUser } from '../enum/rol-user';


@Injectable()
export class RolesGuard extends HandleService implements CanActivate {
  constructor(private reflector: Reflector) {
    super();
  }

  canActivate(context: ExecutionContext): boolean {
    // Leemos los roles requeridos del decorador
    //Por ej: @Roles([TypeUser.administrator])
    const requiredRoles = this.reflector.get<RolUser[]>('roles', context.getHandler());//get handler es el controlador que se está ejecutando, ej:devuelve en este caso de prueba getProfile del controlador auth.controller.ts
    if (!requiredRoles) return true; // si no hay roles requeridos, todos pueden acceder

    const request = context.switchToHttp().getRequest();//Traemos la peticion actual
    const user = request.user;//extraemos el usuario que la realizo

    this.handleException(//handle exception definido en HandleService
      requiredRoles.includes(user.role) ? user.role : null,//comparamos si el usuario tiene el rol requerido
      //si esta incluido user.role devuelve true, si no esta incluido devuelve null
      ForbiddenException,
      `User does not have required role ${requiredRoles}`
      );

    return true;
  }
}
