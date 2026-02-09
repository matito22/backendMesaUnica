
import { Injectable } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

@Injectable()
export class LocalAuthGuard extends AuthGuard('local') {}//Guarda que se llame localAuthGuard y no tener que poner AuthGuard('local') en cada metodo
