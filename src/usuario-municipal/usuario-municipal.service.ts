import { Injectable, NotFoundException } from '@nestjs/common';
import { UpdateUsuarioMunicipalDto } from './dto/update-usuario-municipal.dto';
import { In, Repository } from 'typeorm';
import { UsuarioMunicipal } from './entities/usuario-municipal.entity';
import { HandleService } from '../utils/handle.service';
import * as bcrypt from 'bcrypt';
import { InjectRepository } from '@nestjs/typeorm';

@Injectable()
export class UsuarioMunicipalService extends HandleService {

  constructor(
    @InjectRepository(UsuarioMunicipal)
    private userRepository: Repository<UsuarioMunicipal>) {
    super();
  }
    
   create(data: Partial<UsuarioMunicipal>): UsuarioMunicipal {
    return this.userRepository.create(data);
  }

  save(user: UsuarioMunicipal): Promise<UsuarioMunicipal> {
    return this.userRepository.save(user);
  }


  findAll():Promise<UsuarioMunicipal[]> {
    const users = this.userRepository.find();
    return this.handleException(
      users,
      NotFoundException,
      'No users found'
    );
  }

 async findOne(idUsuario: number): Promise<UsuarioMunicipal> {
  const user = await this.userRepository.findOneBy({ idUsuario});
  return this.handleException(
    user,
    NotFoundException,
    `User with ID ${idUsuario} not found`
  );
}

//Busqueda por nombre utilizada para el login, lanzara exception si no existe
async findByName(nombre: string): Promise<UsuarioMunicipal> {
  const user = await this.userRepository.findOneBy({ nombre });
  return this.handleException(
    user,
    NotFoundException,
    `User with name ${nombre} not found`
  );
}

//Busqueda por nombre utilizada para el register, retorna null si no existe
async findByNameOptional(nombre: string): Promise<UsuarioMunicipal | null> {
    return await this.userRepository.findOneBy({ nombre });
  }

  async update(idUsuario: number, updateUserDto: UpdateUsuarioMunicipalDto): Promise<UsuarioMunicipal> {
    let existingUser = await this.userRepository.findOneBy({ idUsuario });
      existingUser = this.handleException(
        existingUser,
        NotFoundException,
        `User with ID ${idUsuario} not found`
      );
      Object.assign(existingUser, updateUserDto);

      return this.userRepository.save(existingUser);
  }


  async remove(idUsuario: number) {
    let existingUser = await this.userRepository.findOneBy({ idUsuario });
    
    existingUser = this.handleException(
      existingUser,
      NotFoundException,
      `User with ID ${idUsuario} not found`
    );

    return this.userRepository.remove(existingUser);
  }

  //Guardamos null en la columna currentHashedRefreshToken
  //Usamos esta funcion en authservice para eliminar el refresh token de la base de datos
async removeRefreshToken(idUsuario: number): Promise<void> {
  if (!idUsuario) {
    throw new Error('User ID is required to remove refresh token');
  }

  await this.userRepository.update(
    { idUsuario },
    { currentHashedRefreshToken: null }
  );
}



  //Se utiliza para hashear el token y guardarlo en la base de datos
  async setCurrentRefreshToken(idUser: number, token: string) {
  const hashedToken = await bcrypt.hash(token, 10); 
  await this.userRepository.update(idUser, { currentHashedRefreshToken: hashedToken });
}
}
