import { ConflictException, Injectable, NotFoundException, UnauthorizedException } from '@nestjs/common';
import { HandleService } from '../utils/handle.service';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { UsuarioMunicipalService } from 'src/usuario-municipal/usuario-municipal.service';
import { CreateUsuarioMunicipalDto } from 'src/usuario-municipal/dto/create-usuario-municipal.dto';
import { UsuarioMunicipal } from 'src/usuario-municipal/entities/usuario-municipal.entity';
import { RolUser } from '../enum/rol-user';
import { SectorMunicipalService } from 'src/sector-municipal/sector-municipal.service';
import { SectorMunicipal } from 'src/sector-municipal/entities/sector-municipal.entity';
import { ContribuyenteService } from 'src/contribuyente/contribuyente.service';
import { CreateContribuyenteDto } from 'src/contribuyente/dto/create-contribuyente.dto';
import { Contribuyente } from 'src/contribuyente/entities/contribuyente.entity';
import { randomBytes } from 'crypto';
import { v4 as uuidv4 } from 'uuid';
import { MailService } from 'src/mail/mail.service';
import { ActivateContribuyenteDto } from './dto/activate-contribuyente.dto';



@Injectable()
export class AuthService extends HandleService {

//DE MANERA MAS FACIL  Y ESCALABLE CON PASSPORT

constructor(private jwtService:JwtService,private userService:UsuarioMunicipalService, private sectorMunicipalService:SectorMunicipalService,
  private contribuyenteService:ContribuyenteService,private readonly mailService: MailService) {  
    super()
}


//Metodo que valida el usuario y retorna el usuario,llamado desde local.strategy.ts
async validateUser(nombre: string, pass: string): Promise<any> {
    const user = await this.userService.findByNameOptional(nombre);//Se utiliza este porque devuevle null si no existe, y es lo que passport necesita

    if (!user) {
      return null;
    }

    const isMatch = await bcrypt.compare(pass, user.password);

    if (!isMatch) {
      return null;
    }

    const { password, ...result } = user;//Aca sacamos del usuario la password
    return result;//Para poder devolver sin clave al usuario
  }

//Metodo que valida el contribuyente y retorna el contribuyente
async validateContribuyente(dni: string, pass: string): Promise<any> {
  console.log('Buscando contribuyente con dni:', dni);
  
  const contribuyente = await this.contribuyenteService.findByDni(dni);
  console.log('Contribuyente encontrado:', contribuyente);

  if (!contribuyente) {
    console.log('No existe el contribuyente');
    return null;
  }

  if (!contribuyente.activo) {
    console.log('Contribuyente no está activo');
    return null;
  }

  const isMatch = await bcrypt.compare(pass, contribuyente.password);
  console.log('Password coincide:', isMatch);

  if (!isMatch) return null;

  const { password, ...result } = contribuyente;
  return result;
}

//Validamos el usuario y retorna los token y el refresh token
async login(user: any) {
 
    const payload = {
      username: user.nombre,
      sub: user.idUsuario,
      role: user.rol,
      idSector: user.idSector
    };

    const token = this.jwtService.sign(payload, { expiresIn: '15m' });

    const refreshToken = this.jwtService.sign(
      { ...payload, type: 'refresh' },
      { expiresIn: '7d' }
    );


  await this.userService.setCurrentRefreshToken(user.idUsuario, refreshToken);//Funcion en el servicio de usuarios que guarda el refresh token en la base de datos

  return { token,refreshToken};
}

//Validamos el contribuyente y retorna los token y el refresh token
async loginContribuyente(contribuyente: any) {

  console.log('Generando tokens para contribuyente:', contribuyente); // Verificar el contribuyente recibido
  const payload = {
    username: contribuyente.dni,
    sub: contribuyente.idContribuyente,
    role: 'contribuyente' // Asignar un rol fijo para contribuyentes
  };

  const token = this.jwtService.sign(payload, { expiresIn: '15m' });

  const refreshToken = this.jwtService.sign(
    { ...payload, type: 'refresh' },
    { expiresIn: '7d' }
  );

  await this.contribuyenteService.setCurrentRefreshToken(contribuyente.idContribuyente, refreshToken);

  return { token, refreshToken };
}


//Metodo que valida el refresh token y retorna el access token
async refreshToken(refreshToken: string): Promise<any> {
  const payload = this.jwtService.verify(refreshToken);

  if (payload.type !== 'refresh') {
    throw new UnauthorizedException('Invalid token type');
  }


  const user = await this.userService.findOne(payload.sub);//Buscamos el usuario en la base de datos
  if (!user || !user.currentHashedRefreshToken) {//Si no existe o no tiene refresh token guardado, lanzamos una excepcion
    throw new UnauthorizedException('No user found // Invalid refresh token');
  }

  const isRefreshTokenValid = await bcrypt.compare(refreshToken, user.currentHashedRefreshToken);//Comprobamos que el refresh token es valido
  if (!isRefreshTokenValid) {
    throw new UnauthorizedException('Invalid refresh token');//Si no es valido lanzamos una excepcion
  }

  const access_token = this.jwtService.sign(
  { username: payload.username, sub: payload.sub, role: payload.role },
  { expiresIn: '15m' }
);

  return { access_token: access_token };//Retornamos el access token
}

//Metodo que valida el refresh token para contribuyentes y retorna el access token
async refreshTokenContribuyente(refreshToken: string): Promise<any> {
  const payload = this.jwtService.verify(refreshToken);

  if (payload.type !== 'refresh') {
    throw new UnauthorizedException('Invalid token type');
  }

  const contribuyente = await this.contribuyenteService.findOne(payload.sub);
  if (!contribuyente || !contribuyente.currentHashedRefreshToken) {
    throw new UnauthorizedException('No contribuyente found // Invalid refresh token');
  }

  const isRefreshTokenValid = await bcrypt.compare(refreshToken, contribuyente.currentHashedRefreshToken);
  if (!isRefreshTokenValid) {
    throw new UnauthorizedException('Invalid refresh token');
  }

  const access_token = this.jwtService.sign(
    { username: payload.username, sub: payload.sub, role: payload.role },
    { expiresIn: '15m' }
  );

  return { access_token: access_token };
}


async createMunicipal(createUserDto: CreateUsuarioMunicipalDto): Promise<UsuarioMunicipal> {
  // Verificamos si ya existe un usuario con ese nombre
  const existingUser = await this.userService.findByNameOptional(createUserDto.nombre);
  if (existingUser) {
    this.handleDuplicate(
      existingUser,
      ConflictException,
      `User with name ${createUserDto.nombre} already exists`
    );
  }

  // Hasheamos la contraseña
  const hashedPassword = await bcrypt.hash(createUserDto.password, 10);

  // Obtenemos el objeto completo del sector
  const sector= await this.sectorMunicipalService.findOne(createUserDto.sector);

  // determinamos el rol basado en el sector
  let assignedRole: RolUser;
  if (sector.nombre.toUpperCase() === 'MESA_ENTRADA') {
    assignedRole = RolUser.MESA_ENTRADA;
  } else {
    assignedRole = RolUser.REVISOR;
  }

const { sector: _, ...dtoSinSector } = createUserDto; //excluímos el campo sector del DTO

const newUser = this.userService.create({
  ...dtoSinSector,
  password: hashedPassword,
  idSector: sector.idSector,
  rol: assignedRole,
});

  // Guardamos y retornamos
  return this.userService.save(newUser);
}


async createContribuyente(createContribuyenteDto: CreateContribuyenteDto): Promise<Contribuyente> {

    const existingContribuyente =
    await this.contribuyenteService.findByDni(createContribuyenteDto.dni);

    if (existingContribuyente) {
      this.handleDuplicate(
        existingContribuyente,
        ConflictException,
        `Contribuyente with dni ${createContribuyenteDto.dni} already exists`
      );
    }

    // 🔐 password temporal (NUNCA se envía)
    const tempPassword = randomBytes(8).toString('hex');
    const hashedPassword = await bcrypt.hash(tempPassword, 10);

    // 🔑 token de activación
    const activationToken = uuidv4();

    const newContribuyente = this.contribuyenteService.create({
      ...createContribuyenteDto,
      password: hashedPassword,
      activo: false,
      activationToken
    });

    await this.contribuyenteService.save(newContribuyente);

    try{
       await this.mailService.sendMail(
      createContribuyenteDto.email,
      'Bienvenido al Sistema Municipal',
      './mailContribuyente',
      {
        nombre: createContribuyenteDto.nombre, // ✅ {{nombre}} en el template
        activationUrl: `http://localhost:4200/activar?id=${newContribuyente.idContribuyente}&code=${activationToken}`, // ✅ Enlace de activación
      }
    );

    }catch(error){
      console.error('Error al enviar el correo de bienvenida:', error);
    }

  
    return newContribuyente;

}

//Se usa internamente en el backend para activar un contribuyente
async activateContribuyente(dto: ActivateContribuyenteDto): Promise<void> {
  const { id, code, password } = dto;
  const contribuyente = await this.contribuyenteService.finOneInactiveByIdAndActivationToken(id, code);
  
  if (!contribuyente) {
    throw new UnauthorizedException('El contribuyente no existe o el token no es válido');
  }

  const hashedPassword = await bcrypt.hash(password, 10);

  await this.contribuyenteService.activateContribuyente(contribuyente, hashedPassword);
}


//LOGOUT DEL USUARIO MUNICIPAL Y DEL CONTRIBUYENTE, AMBOS BORRAN EL REFRESH
async logout(idUser: number) {
  await this.userService.removeRefreshToken(idUser);
}

async logoutContribuyente(idContribuyente: number) {
  await this.contribuyenteService.removeRefreshToken(idContribuyente);
}

}