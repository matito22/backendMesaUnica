import { SetMetadata } from '@nestjs/common';
import { RolUser } from '../enum/rol-user';


//roles: TypeUser[] es un array de TypeUser, permite pasar varios roles
//SetMetadata es un metodo de la clase SetMetadata, que se encarga de guardar un metadato en la clase
export const Roles = (...roles: RolUser[]) => SetMetadata('roles', roles);
