import { Controller, Get, Post, Body, Delete, HttpStatus, HttpCode, UseGuards, Request, Res, UnauthorizedException, Req, Query } from '@nestjs/common';
import { AuthService } from './auth.service';
import { ApiBearerAuth, ApiBody } from '@nestjs/swagger';
import { LocalAuthGuard } from './local-auth-guard';
import { JwtAuthGuard } from './jwt-auth.guard';
import { LocalAuthContribuyenteGuard } from './local-auth-contribuyente.guard';
import { Response } from 'express';
import { Roles } from './roles.decorator';
import { RolesGuard } from './roles.guard';
import { Public } from './public-key';
import { CreateUsuarioMunicipalDto } from '../usuario-municipal/dto/create-usuario-municipal.dto';
import { LoginDto } from './dto/login.dto';
import { CreateContribuyenteDto } from '../contribuyente/dto/create-contribuyente.dto';
import { RolUser } from '../enum/rol-user';
import { ActivateContribuyenteDto } from './dto/activate-contribuyente.dto';
import { LoginContribuyenteDto } from './dto/login-contribuyente.dto';



//En este controlador se encarga de validar el usuario y el token
//LocalAuthGuard y JwtAuthGuard son guards que se encargan de validar el usuario y el token
//LocalAuthguard llama al validate de local.strategy.ts , local.strategy.ts valida el usuario con el metodo validateUser de auth.service.ts y retorna el usuario ,guarda el usuario en req.user
//JwtAuthGuard llama al validate de jwt.strategy.ts , jwt.strategy.ts valida el token con Validate  y retorna el usuario ,guarda el usuario en req.user.Y luego se realiza lo que este dentro de ese controller

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  
  
@UseGuards(JwtAuthGuard,RolesGuard)
//@Public()//PARA CREAR EL PRIMERO USUARIO, SI NO PONEMOS PUBLIC, NO PODEMOS CREAR EL PRIMER USUARIO PORQUE NO TENEMOS TOKEN
@Roles(RolUser.ADMIN)
@Post('registrar/municipal')
create(@Body() createUserDto: CreateUsuarioMunicipalDto) {
    return this.authService.createMunicipal(createUserDto);
}

    
@UseGuards(JwtAuthGuard,RolesGuard)
@Roles(RolUser.ADMIN,RolUser.MESA_ENTRADA)
@Post('registrar/contribuyente')
  createContribuyente(@Body() createContribuyenteDto: CreateContribuyenteDto,) {
  return this.authService.createContribuyente(createContribuyenteDto);
  }





@UseGuards(LocalAuthGuard)
@Public()
@ApiBody({ type: LoginDto })
@Post('login')
async login(@Request() req,@Res({ passthrough: true }) res: Response) {

  const { token,refreshToken} = await this.authService.login(req.user);//Obtenemos el token y el usuario

  

  res.cookie('access_token', token, {//Guardamos el token en cookie
    httpOnly: true,//La cookie solo puede ser accedida por el servidor
    secure: process.env.NODE_ENV === 'production',//la cookie solo puede ser accedida en https
    sameSite: 'lax',//La cookie solo puede ser accedida en el mismo dominio
    maxAge: 15 * 60 * 1000, // Tiene validez de 15 minutos
    path: '/',
  });

  res.cookie('refresh_token', refreshToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 7 * 24 * 60 * 60 * 1000, // Tiene validez de 7 dias
    path: '/',
  });

  res.status(200)
  .json({
    ok: true,
    message:'Login Successful'
   });
  
}

@UseGuards(LocalAuthContribuyenteGuard)
@Public()
@ApiBody({ type: LoginContribuyenteDto })
@Post('login/contribuyente')
async loginContribuyente(@Request() req, @Res({ passthrough: true }) res: Response) {
  const { token, refreshToken } = await this.authService.loginContribuyente(req.user);

  console.log('Login Contribuyente:', req.user); // Verificar el usuario logueado

  res.cookie('access_token', token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 15 * 60 * 1000,
    path: '/',
  });

  res.cookie('refresh_token', refreshToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 7 * 24 * 60 * 60 * 1000,
    path: '/',
  });

  res.status(200).json({
    ok: true,
    message: 'Login Contribuyente Successful'
  });
}

//Req representa lo que el cliente envia al servidor: headers, cookies, body, etc, viene cargador con los datos del user que se ha logueado por JWT

//Res es lo que devuelve el servidor, status code,headers,cookies,body
@Public()//Si no es public, no podes acceder cuando el token ya vencio
@HttpCode(HttpStatus.OK)
@Post('refresh')
async refresh(@Req() req, @Res({ passthrough: true }) res: Response) {
  const refreshToken = req.cookies['refresh_token'];//Usamos req para leer las cookies que envio el cliente


  if (!refreshToken) throw new UnauthorizedException('No refresh token');

  const { access_token } = await this.authService.refreshToken(refreshToken);
    res.cookie('access_token', access_token, {//
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 15 * 60 * 1000,
    });

    return { message: 'Access token refreshed' };
  }

@Public()
@HttpCode(HttpStatus.OK)
@Post('refresh/contribuyente')
async refreshContribuyente(@Req() req, @Res({ passthrough: true }) res: Response) {
  const refreshToken = req.cookies['refresh_token'];

  if (!refreshToken) throw new UnauthorizedException('No refresh token');

  const { access_token } = await this.authService.refreshTokenContribuyente(refreshToken);
  res.cookie('access_token', access_token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 15 * 60 * 1000,
  });

  return { message: 'Access token refreshed' };
}



//Eliminar cookie, no necesita ir en service, controller maneja HTTP 
@Post('logout')
@HttpCode(HttpStatus.OK)
async logout(@Req() req, @Res({ passthrough: true }) res: Response) {
  res.clearCookie('access_token');//Lo eliminamos del navegador
  res.clearCookie('refresh_token');//Lo eliminamos del navegador
  console.log(req.user);

  await this.authService.logout(req.user.userId);//Eliminamos el refresh token de la base de datos del id que le pasamos
  return { message: 'Logout successful' };
}

@Post('logout/contribuyente')
@HttpCode(HttpStatus.OK)
async logoutContribuyente(@Req() req, @Res({ passthrough: true }) res: Response) {
  res.clearCookie('access_token');
  res.clearCookie('refresh_token');
  console.log(req.user);

  await this.authService.logoutContribuyente(req.user.idContribuyente);
  return { message: 'Logout contribuyente successful' };
}

@Public()
@Post('activate-contribuyente')
async activateContribuyente(@Body() activateContributenteDto: ActivateContribuyenteDto) {
  return this.authService.activateContribuyente(activateContributenteDto);
  
}


  @UseGuards(RolesGuard)
  @Get('profile')
  getProfile(@Request() req) {
    return req.user;
  }


}