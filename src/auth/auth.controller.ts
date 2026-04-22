import {
  Controller, Get, Post, Body, Delete, HttpStatus, HttpCode,
  UseGuards, Request, Res, UnauthorizedException, Req, Query,
  ForbiddenException
} from '@nestjs/common';
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
import { ActivateUsuarioDto } from './dto/activate-usuario.dto';
import { ForgotPasswordDto } from './dto/forgot-password.dto';
import { ResetPasswordDto } from './dto/reset-password.dto';


// Punto de entrada HTTP para autenticación: registro, login, logout, refresh y activación de cuenta.
// LocalAuthGuard valida usuario/password → llama a local.strategy.ts → AuthService.validateUser
// JwtAuthGuard valida el token JWT en cada request protegido
// RolesGuard verifica que el usuario tenga el rol requerido
// @Public() marca una ruta como accesible sin token

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  // [C-01] Registra un usuario municipal. Solo ADMIN puede hacerlo.
  // Llama a → [S-01] AuthService.createMunicipal
  @UseGuards(JwtAuthGuard, RolesGuard)
  // @Public() // ← Descomentar solo para crear el primer ADMIN. Volver a comentar después.
  @Roles(RolUser.ADMIN)
  @Post('registrar/municipal')
  create(@Body() createUserDto: CreateUsuarioMunicipalDto) {
    return this.authService.createMunicipal(createUserDto);
  }

  // [C-02] Registra un contribuyente. Solo ADMIN o MESA_ENTRADA pueden hacerlo.
  // Llama a → [S-02] AuthService.createContribuyente
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(RolUser.ADMIN, RolUser.MESA_ENTRADA)
  @Post('registrar/contribuyente')
  createContribuyente(@Body() createContribuyenteDto: CreateContribuyenteDto) {
    return this.authService.createContribuyente(createContribuyenteDto);
  }

  // [C-03] Login de usuario municipal. LocalAuthGuard valida credenciales antes de entrar.
  // Llama a → [S-03] AuthService.login
  @UseGuards(LocalAuthGuard)
  @Public() // Sin token porque el usuario está intentando obtenerlo
  @ApiBody({ type: LoginDto })
  @Post('login')
  async login(@Request() req, @Res({ passthrough: true }) res: Response) {
    const { token, refreshToken } = await this.authService.login(req.user);

    // [C-03-A] Validación de IP de red municipal (debe iniciar con 10.10)
    const clientIp =
      (req.headers['x-forwarded-for'] as string)?.split(',')[0].trim() ??
      req.socket.remoteAddress ?? '';

    /*if (!clientIp.startsWith('10.10')) {
      throw new ForbiddenException('Access restricted to municipal network');
    }*/

    if (
      !clientIp.startsWith('10.10') &&
      clientIp !== '127.0.0.1' &&
      clientIp !== '::1'
    ) {
      throw new ForbiddenException('Access restricted to municipal network');
    }

    res.cookie('access_token', token, {
      httpOnly: true, // No accesible desde JS del navegador (protección XSS)
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 15 * 60 * 1000, // 15 minutos
      path: '/',
    });

    res.cookie('refresh_token', refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 días
      path: '/',
    });

    res.status(200).json({ ok: true, message: 'Login Successful' });
  }

  // [C-04] Login de contribuyente. LocalAuthContribuyenteGuard valida credenciales.
  // Llama a → [S-05] AuthService.loginContribuyente
  @UseGuards(LocalAuthContribuyenteGuard)
  @Public()
  @ApiBody({ type: LoginContribuyenteDto })
  @Post('login/contribuyente')
  async loginContribuyente(@Request() req, @Res({ passthrough: true }) res: Response) {
    const { token, refreshToken } = await this.authService.loginContribuyente(req.user);


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

    res.status(200).json({ ok: true, message: 'Login Contribuyente Successful' });
  }

  // [C-05] Renueva el access_token usando el refresh_token de la cookie.
  // @Public() porque el access_token ya expiró cuando se llama esto.
  // Llama a → [S-07] AuthService.refreshToken
@Public()
@HttpCode(HttpStatus.OK)
@Post('refresh')
async refresh(@Req() req, @Res({ passthrough: true }) res: Response) {
  const refreshToken = req.cookies['refresh_token'];

  if (!refreshToken) {
    res.clearCookie('access_token', { path: '/' });
    res.clearCookie('refresh_token', { path: '/' });
    throw new UnauthorizedException('No refresh token');
  }

  try {
    const { access_token } = await this.authService.refreshToken(refreshToken);

    res.cookie('access_token', access_token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 15 * 60 * 1000,
      path: '/',
    });

    return { message: 'Access token refreshed' };
  } catch (error) {
    // Token inválido → limpiar las cookies huérfanas
    res.clearCookie('access_token', { path: '/' });
    res.clearCookie('refresh_token', { path: '/' });
    throw new UnauthorizedException('Invalid refresh token');
  }
}

  // [C-06] Igual que [C-05] pero para contribuyentes.
  // Llama a → [S-08] AuthService.refreshTokenContribuyente
  @Public()
  @HttpCode(HttpStatus.OK)
  @Post('refresh/contribuyente')
  async refreshContribuyente(@Req() req, @Res({ passthrough: true }) res: Response) {
   

     const refreshToken = req.cookies['refresh_token'];

  if (!refreshToken) {
    res.clearCookie('access_token', { path: '/' });
    res.clearCookie('refresh_token', { path: '/' });
    throw new UnauthorizedException('No refresh token');
  }

  try {
    const { access_token } = await this.authService.refreshTokenContribuyente(refreshToken);

    res.cookie('access_token', access_token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 15 * 60 * 1000,
      path: '/',
    });

    return { message: 'Access token refreshed' };
  } catch (error) {
    // Token inválido → limpiar las cookies huérfanas
    res.clearCookie('access_token', { path: '/' });
    res.clearCookie('refresh_token', { path: '/' });
    throw new UnauthorizedException('Invalid refresh token');
  }
  }
  

  // [C-07] Cierra sesión del usuario municipal: borra cookies y elimina el refresh_token de la DB.
  // Llama a → [S-09] AuthService.logout
  @Post('logout')
  @HttpCode(HttpStatus.OK)
  async logout(@Req() req, @Res({ passthrough: true }) res: Response) {
    res.clearCookie('access_token');
    res.clearCookie('refresh_token');
    await this.authService.logout(req.user.userId);
    return { message: 'Logout successful' };
  }

  // [C-08] Igual que [C-07] pero para contribuyentes.
  // Llama a → [S-10] AuthService.logoutContribuyente
  @Post('logout/contribuyente')
  @HttpCode(HttpStatus.OK)
  async logoutContribuyente(@Req() req, @Res({ passthrough: true }) res: Response) {
    res.clearCookie('access_token');
    res.clearCookie('refresh_token');
    await this.authService.logoutContribuyente(req.user.idContribuyente);
    return { message: 'Logout contribuyente successful' };
  }

  // [C-09] Activa la cuenta del contribuyente con el link recibido por email.
  // @Public() porque aún no tiene cuenta activa ni token.
  // Llama a → [S-11] AuthService.activateContribuyente
  @Public()
  @Post('activate-contribuyente')
  async activateContribuyente(@Body() activateContributenteDto: ActivateContribuyenteDto) {
    return this.authService.activateContribuyente(activateContributenteDto);
  }

  @Public()
  @Post('activate-usuario')
  async activateUsuario(@Body() activateUsuarioDto: ActivateUsuarioDto) {
    return this.authService.activateUsuario(activateUsuarioDto);
  }

  // [C-10] Devuelve el perfil del usuario autenticado (viene en el JWT, no va al servicio).
  @UseGuards(RolesGuard)
  @Get('profile')
  getProfile(@Request() req) {

    return req.user;
  }

//Necesitamos el email para poder identificarlo
 @Public()
  @Post('forgot-password')
  async forgotPassword(@Body() { email, userType }: ForgotPasswordDto) {
    await this.authService.forgotPassword(email, userType);
    return { message: 'Si el correo existe, recibirás un enlace para restablecer tu contraseña.' };
  }

//En este caso el usuario ya tiene token porque hizo clic en el enlace del email, entonces lo buscamos por token.
 @Public()
  @Post('reset-password')
  async resetPassword(@Body() { token, newPassword, userType }: ResetPasswordDto) {
    await this.authService.resetPassword(token, newPassword, userType);
    return { message: 'Contraseña actualizada correctamente.' };
  }
}
