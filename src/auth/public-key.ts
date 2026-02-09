
import { SetMetadata } from '@nestjs/common';

//PUBLIC SE PONE CUANDO NO NECESITO ESTAR LOGUEADO PARA UTILIZAR EL SISTEMA
export const IS_PUBLIC_KEY = 'isPublic';
export const Public = () => SetMetadata(IS_PUBLIC_KEY, true);
