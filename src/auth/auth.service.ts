import {
  BadRequestException,
  ConflictException, Injectable, NotFoundException, UnauthorizedException
} from '@nestjs/common';
import { HandleService } from '../utils/handle.service';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import * as crypto from 'crypto';
import { UsuarioMunicipalService } from '../usuario-municipal/usuario-municipal.service';
import { CreateUsuarioMunicipalDto } from '../usuario-municipal/dto/create-usuario-municipal.dto';
import { UsuarioMunicipal } from '../usuario-municipal/entities/usuario-municipal.entity';
import { RolUser } from '../enum/rol-user';
import { SectorMunicipalService } from 'src/sector-municipal/sector-municipal.service';

import { ContribuyenteService } from '../contribuyente/contribuyente.service';
import { CreateContribuyenteDto } from '../contribuyente/dto/create-contribuyente.dto';
import { Contribuyente } from '../contribuyente/entities/contribuyente.entity';
import { randomBytes } from 'crypto';
import { v4 as uuidv4 } from 'uuid';
import { MailService } from '../mail/mail.service';
import { ActivateContribuyenteDto } from './dto/activate-contribuyente.dto';
import { ActivateUsuarioDto } from './dto/activate-usuario.dto';

@Injectable()
export class AuthService extends HandleService {

  constructor(
    private jwtService: JwtService,
    private userService: UsuarioMunicipalService,
    private sectorMunicipalService: SectorMunicipalService,
    private contribuyenteService: ContribuyenteService,
    private readonly usuarioMunicipalService: UsuarioMunicipalService,
    private readonly mailService: MailService
  ) {
    super();
  }

  // [S-04] Valida usuario y contraseña. Llamado por local.strategy.ts en el login.
  // Retorna null (sin excepción) porque Passport lo requiere así para devolver 401.
  async validateUser(nombre: string, pass: string): Promise<any> {
    const user = await this.userService.findByNameOptional(nombre); // Retorna null si no existe

    if (!user) return null;

    const isMatch = await bcrypt.compare(pass, user.password); // Compara contra el hash guardado
    if (!isMatch) return null;

    const { password, ...result } = user; // Excluimos la password antes de retornar
    return result;
  }

  // [S-06] Igual que [S-04] pero para contribuyentes. Verifica además que esté activo.
  async validateContribuyente(dni: string, pass: string): Promise<any> {
  
    const contribuyente = await this.contribuyenteService.findByDni(dni);

    if (!contribuyente) {  return null; }
    if (!contribuyente.activo) { return null; } // Solo puede loguear si activó la cuenta

    const isMatch = await bcrypt.compare(pass, contribuyente.password);

    if (!isMatch) return null;

    const { password, ...result } = contribuyente;
    return result;
  }

  // [S-03] Genera access_token (15min) y refresh_token (7d) para el usuario municipal.
  // Guarda el refresh_token hasheado en DB para poder invalidarlo en el logout.
  async login(user: any) {
    const payload = {
      username: user.nombre,
      sub: user.idUsuario,
      role: user.rol,
      idSector: user.idSector
    };

    const token = this.jwtService.sign(payload, { expiresIn: '15m' });
    const refreshToken = this.jwtService.sign(
      { ...payload, type: 'refresh' }, // type:'refresh' para diferenciarlo del access_token
      { expiresIn: '7d' }
    );

    await this.userService.setCurrentRefreshToken(user.idUsuario, refreshToken); // Guarda el hash en DB

    return { token, refreshToken };
  }

  // [S-05] Igual que [S-03] pero para contribuyentes. El rol es fijo ('contribuyente').
  async loginContribuyente(contribuyente: any) {

    const payload = {
      username: contribuyente.dni,
      sub: contribuyente.idContribuyente,
      role: 'contribuyente'
    };

    const token = this.jwtService.sign(payload, { expiresIn: '15m' });
    const refreshToken = this.jwtService.sign(
      { ...payload, type: 'refresh' },
      { expiresIn: '7d' }
    );

    await this.contribuyenteService.setCurrentRefreshToken(contribuyente.idContribuyente, refreshToken);

    return { token, refreshToken };
  }

  // [S-07] Valida el refresh_token y emite un nuevo access_token.
  // Verifica que el token no fue revocado comparando contra lo guardado en DB.
  async refreshToken(refreshToken: string): Promise<any> {
    const payload = this.jwtService.verify(refreshToken);

    if (payload.type !== 'refresh') throw new UnauthorizedException('Invalid token type'); // Evita usar un access_token aquí

    const user = await this.userService.findOne(payload.sub);
    if (!user || !user.currentHashedRefreshToken) {
      throw new UnauthorizedException('No user found // Invalid refresh token');
    }

    const isRefreshTokenValid = await bcrypt.compare(refreshToken, user.currentHashedRefreshToken); // Verifica que no fue revocado por logout
    if (!isRefreshTokenValid) throw new UnauthorizedException('Invalid refresh token');

    const access_token = this.jwtService.sign(
      { username: payload.username, sub: payload.sub, role: payload.role },
      { expiresIn: '15m' }
    );

    return { access_token };
  }

  // [S-08] Igual que [S-07] pero busca en la tabla de contribuyentes.
  async refreshTokenContribuyente(refreshToken: string): Promise<any> {
    const payload = this.jwtService.verify(refreshToken);

    if (payload.type !== 'refresh') throw new UnauthorizedException('Invalid token type');

    const contribuyente = await this.contribuyenteService.findOne(payload.sub);
    if (!contribuyente || !contribuyente.currentHashedRefreshToken) {
      throw new UnauthorizedException('No contribuyente found // Invalid refresh token');
    }

    const isRefreshTokenValid = await bcrypt.compare(refreshToken, contribuyente.currentHashedRefreshToken);
    if (!isRefreshTokenValid) throw new UnauthorizedException('Invalid refresh token');

    const access_token = this.jwtService.sign(
      { username: payload.username, sub: payload.sub, role: payload.role },
      { expiresIn: '15m' }
    );

    return { access_token };
  }

  // [S-01] Crea un usuario municipal. El rol se asigna automáticamente según el sector.
  async createMunicipal(createUserDto: CreateUsuarioMunicipalDto): Promise<UsuarioMunicipal> {
    const existingUser = await this.userService.findByNameOptional(createUserDto.nombre);
    if (existingUser) {
      this.handleDuplicate(existingUser, ConflictException, `User with name ${createUserDto.nombre} already exists`);
    }

    const tempPassword = randomBytes(8).toString('hex'); // Contraseña temporal que el ciudadano nunca conoce
    const hashedPassword = await bcrypt.hash(tempPassword, 10);
    const activationToken = uuidv4(); // Token único para verificar identidad en la activación

    const sector = await this.sectorMunicipalService.findOne(createUserDto.sector);
    if (!sector) {
      throw new NotFoundException('No se indico a que sector pertenece el usuario');
    }

    const sectorNameUpperCase = sector.nombre.toUpperCase();
    let assignedRole: RolUser;

    if (sectorNameUpperCase === 'INFORMATICA') {
      assignedRole = RolUser.ADMIN;
    } else if (sectorNameUpperCase === 'MESA DE ENTRADA') {
      assignedRole = RolUser.MESA_ENTRADA;
    } else {
      assignedRole = RolUser.REVISOR;
    }

    const { sector: _, ...dtoSinSector } = createUserDto; // Excluimos 'sector' porque en la entidad va como idSector

    const newUser = this.userService.create({
      ...dtoSinSector,
      password: hashedPassword,
      idSector: sector.idSector,
      activo:false,
      rol: assignedRole,
      activationToken,
    });

    
    await  this.userService.save(newUser);

    

    try {
      
        await this.mailService.sendMail(
        createUserDto.email,
        'Bienvenido al Sistema Municipal',
        './mailUsuarioMunicipal',
        {
          nombre: createUserDto.nombre,
          activationUrl: `${process.env.CORS_ORIGIN}/activar?id=${newUser.idUsuario}&code=${activationToken}&type=usuario-municipal`,
        }
      );
      
    } catch (error) {
      console.error('Error al enviar el correo de activación:', error);
      // No lanzamos el error para no revertir el registro si el mail falla
    }
    
    return newUser;
  }

  // [S-02] Crea un contribuyente con cuenta inactiva y envía email de activación.
  async createContribuyente(createContribuyenteDto: CreateContribuyenteDto): Promise<Contribuyente> {
    const existingContribuyente = await this.contribuyenteService.findByDni(createContribuyenteDto.dni);
    if (existingContribuyente) {
      this.handleDuplicate(existingContribuyente, ConflictException, `Contribuyente with dni ${createContribuyenteDto.dni} already exists`);
    }

    const tempPassword = randomBytes(8).toString('hex'); // Contraseña temporal que el ciudadano nunca conoce
    const hashedPassword = await bcrypt.hash(tempPassword, 10);
    const activationToken = uuidv4(); // Token único para verificar identidad en la activación

    const newContribuyente = this.contribuyenteService.create({
      ...createContribuyenteDto,
      password: hashedPassword,
      activo: false, // La cuenta empieza inactiva hasta que el ciudadano active desde el email
      activationToken
    });


    await this.contribuyenteService.save(newContribuyente);
 
    try {
      
       
       await this.mailService.sendMail(
        createContribuyenteDto.email,
        'Bienvenido al Sistema Municipal',
        './mailContribuyente',//<-- esto es el template que se va a usar
        {
          nombre: createContribuyenteDto.nombre,
          activationUrl: `${process.env.CORS_ORIGIN}/activar?id=${newContribuyente.idContribuyente}&code=${activationToken}&type=contribuyente`,
        }
      );
    
    } catch (error) {
      console.error('❌ Error completo:', error); // <-- antes solo logueabas el error pero lo tragabas
    }

    return newContribuyente;
  }

  // [S-11] Activa la cuenta del contribuyente. Invalida el token para que el link no se reutilice.
  async activateContribuyente(dto: ActivateContribuyenteDto): Promise<void> {
    const { id, code, password } = dto;
    const contribuyente = await this.contribuyenteService.finOneInactiveByIdAndActivationToken(id, code);

    if (!contribuyente) throw new UnauthorizedException('El contribuyente no existe o el token no es válido');

    const hashedPassword = await bcrypt.hash(password, 10);
    await this.contribuyenteService.activateContribuyente(contribuyente, hashedPassword);
  }


  // [S-12] Activa la cuenta del usuario. Invalida el token para que el link no se reutilice.
  async activateUsuario(dto: ActivateUsuarioDto): Promise<void> {
    const { id, code, password } = dto;
    const usuario = await this.userService.finOneInactiveByIdAndActivationToken(id, code);

    if (!usuario) throw new UnauthorizedException('El usuario no existe o el token no es válido');

    const hashedPassword = await bcrypt.hash(password, 10);
    await this.userService.activateUsuario(usuario, hashedPassword);
  }

  // [S-09] Elimina el refresh_token de la DB al hacer logout del usuario municipal.
  async logout(idUser: number) {
    await this.userService.removeRefreshToken(idUser);
  }

  // [S-10] Igual que [S-09] pero para contribuyentes.
  async logoutContribuyente(idContribuyente: number) {
    await this.contribuyenteService.removeRefreshToken(idContribuyente);
  }


async forgotPassword(email: string, userType: 'municipal' | 'contribuyente'): Promise<void> {

  const plainToken = crypto.randomBytes(32).toString('hex');
  const hashedToken = await bcrypt.hash(plainToken, 10);
  const expires = new Date(Date.now() + 30 * 60 * 1000);

  if (userType === 'municipal') {
    const user = await this.usuarioMunicipalService.findByEmail(email);
    if (!user) return;
    await this.usuarioMunicipalService.setResetPasswordToken(user.idUsuario, hashedToken, expires);
    const resetLink = `${process.env.CORS_ORIGIN}/reset-password?token=${plainToken}&email=${email}&type=${userType}`;
    await this.mailService.sendMail(user.email, 'Recuperación de contraseña', './resetPassword', { nombre: user.nombre, resetUrl: resetLink });

  } else {
    const user = await this.contribuyenteService.findByEmail(email);
    if (!user) return;
    await this.contribuyenteService.setResetPasswordToken(user.idContribuyente, hashedToken, expires);
    const resetLink = `${process.env.CORS_ORIGIN}/reset-password?token=${plainToken}&email=${email}&type=${userType}`;
    await this.mailService.sendMail(user.email, 'Recuperación de contraseña', './resetPassword', { nombre: user.nombre, resetUrl: resetLink });
  }
}

async resetPassword(
  email: string,
  plainToken: string,
  newPassword: string,
  userType: 'municipal' | 'contribuyente'
): Promise<void> {

  const hashedPassword = await bcrypt.hash(newPassword, 10);

  if (userType === 'municipal') {
    const user = await this.usuarioMunicipalService.findByEmail(email);
    if (!user?.reset_password_token || !user?.reset_password_expires) throw new BadRequestException('Token inválido o expirado');
    if (new Date() > user.reset_password_expires) throw new BadRequestException('El token ha expirado, solicitá uno nuevo');
    const isValid = await bcrypt.compare(plainToken, user.reset_password_token);
    if (!isValid) throw new BadRequestException('Token inválido o expirado');
    await this.usuarioMunicipalService.clearResetPasswordToken(user.idUsuario, hashedPassword);

  } else {
    const user = await this.contribuyenteService.findByEmail(email);
    if (!user?.reset_password_token || !user?.reset_password_expires) throw new BadRequestException('Token inválido o expirado');
    if (new Date() > user.reset_password_expires) throw new BadRequestException('El token ha expirado, solicitá uno nuevo');
    const isValid = await bcrypt.compare(plainToken, user.reset_password_token);
    if (!isValid) throw new BadRequestException('Token inválido o expirado');
    await this.contribuyenteService.clearResetPasswordToken(user.idContribuyente, hashedPassword);
  }
}
}
