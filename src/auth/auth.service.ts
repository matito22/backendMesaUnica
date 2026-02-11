import { ConflictException, Injectable, NotFoundException, UnauthorizedException } from '@nestjs/common';
import { HandleService } from '../utils/handle.service';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { UsuarioMunicipalService } from 'src/usuario-municipal/usuario-municipal.service';
import { CreateUsuarioMunicipalDto } from 'src/usuario-municipal/dto/create-usuario-municipal.dto';
import { UsuarioMunicipal } from 'src/usuario-municipal/entities/usuario-municipal.entity';
import { SectorMunicipalService } from 'src/sector-municipal/sector-municipal.service';
import { SectorMunicipal } from 'src/sector-municipal/entities/sector-municipal.entity';
import { ContribuyenteService } from 'src/contribuyente/contribuyente.service';
import { CreateContribuyenteDto } from 'src/contribuyente/dto/create-contribuyente.dto';
import { Contribuyente } from 'src/contribuyente/entities/contribuyente.entity';




@Injectable()
export class AuthService extends HandleService {

//DE MANERA MAS FACIL  Y ESCALABLE CON PASSPORT

constructor(private jwtService:JwtService,private userService:UsuarioMunicipalService, private sectorMunicipalService:SectorMunicipalService,private contribuyenteService:ContribuyenteService){  
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


//Validamos el usuario y retorna los token y el refresh token
async login(user: any) {
 
  const payload = { username: user.nombre, sub: user.idUsuario ,role:user.RolUser};

  const token = this.jwtService.sign(payload,{ expiresIn: '15m' });

  const refreshToken = this.jwtService.sign({payload,type:'refresh'},{ expiresIn: '7d' });


  await this.userService.setCurrentRefreshToken(user.idUsuario, refreshToken);//Funcion en el servicio de usuarios que guarda el refresh token en la base de datos

  return { token,refreshToken};
}


//Metodo que valida el refresh token y retorna el access token
async refreshToken(refreshToken: string): Promise<any> {
  const payload = this.jwtService.verify(refreshToken);

  const user = await this.userService.findOne(payload.sub);//Buscamos el usuario en la base de datos
  if (!user || !user.currentHashedRefreshToken) {//Si no existe o no tiene refresh token guardado, lanzamos una excepcion
    throw new UnauthorizedException('No user found // Invalid refresh token');
  }

  const isRefreshTokenValid = await bcrypt.compare(refreshToken, user.currentHashedRefreshToken);//Comprobamos que el refresh token es valido
  if (!isRefreshTokenValid) {
    throw new UnauthorizedException('Invalid refresh token');//Si no es valido lanzamos una excepcion
  }

  const access_token = this.jwtService.sign(//Creamos el access token
    { username: payload.username, sub: payload.sub, role: payload.role },
    { expiresIn: '15m' }
  );

  return { access_token: access_token };//Retornamos el access token
}


async create(createUserDto: CreateUsuarioMunicipalDto): Promise<UsuarioMunicipal> {
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

  // Creamos el usuario
  const newUser = this.userService.create({
    ...createUserDto,
    password: hashedPassword,
    idSector: sector,
  });

  // Guardamos y retornamos
  return this.userService.save(newUser);
}


async createContribuyente(createContribuyenteDto: CreateContribuyenteDto): Promise<Contribuyente> {

  const existingContribuyente = await this.contribuyenteService.findByDni(createContribuyenteDto.dni);
  if (existingContribuyente) {
    this.handleDuplicate(
      existingContribuyente,
      ConflictException,
      `Contribuyente with dni ${createContribuyenteDto.dni} already exists`
    );
  }


  const hashedPassword = await bcrypt.hash(createContribuyenteDto.password, 10);


  const newContribuyente = this.contribuyenteService.create({
    ...createContribuyenteDto,
    password: hashedPassword
  });

  // Guardamos y retornamos
  return this.contribuyenteService.save(newContribuyente);
}



  //Eliminamos el refresh token de la base de datos, lo usamos en el controller de auth
  async logout(idUser: number) {
  await this.userService.removeRefreshToken(idUser);
}

}