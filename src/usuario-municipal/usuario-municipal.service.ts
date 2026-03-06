import { Injectable, NotFoundException } from '@nestjs/common';
import { UpdateUsuarioMunicipalDto } from './dto/update-usuario-municipal.dto';
import { Repository } from 'typeorm';
import { UsuarioMunicipal } from './entities/usuario-municipal.entity';
import { HandleService } from '../utils/handle.service';
import * as bcrypt from 'bcrypt';
import { InjectRepository } from '@nestjs/typeorm';

@Injectable()
export class UsuarioMunicipalService extends HandleService {

  constructor(
    @InjectRepository(UsuarioMunicipal)
    private userRepository: Repository<UsuarioMunicipal>
  ) {
    super();
  }

  // create/save son internos: los usa AuthService para construir y persistir el usuario por separado
  create(data: Partial<UsuarioMunicipal>): UsuarioMunicipal {
    return this.userRepository.create(data);
  }
  save(user: UsuarioMunicipal): Promise<UsuarioMunicipal> {
    return this.userRepository.save(user);
  }

  // [S-32] Devuelve todos los usuarios municipales.
  findAll(): Promise<UsuarioMunicipal[]> {
    const users = this.userRepository.find();
    return this.handleException(users, NotFoundException, 'No users found');
  }

  // [S-33] Devuelve un usuario por id. Lo usa también AuthService [S-07] al refrescar el token.
  async findOne(idUsuario: number): Promise<UsuarioMunicipal> {
    const user = await this.userRepository.findOneBy({ idUsuario });
    return this.handleException(user, NotFoundException, `User with ID ${idUsuario} not found`);
  }

  // findByName lanza excepción si no existe. Para cuando el usuario YA tiene que existir.
  async findByName(nombre: string): Promise<UsuarioMunicipal> {
    const user = await this.userRepository.findOneBy({ nombre });
    return this.handleException(user, NotFoundException, `User with name ${nombre} not found`);
  }

  // findByNameOptional retorna null si no existe (sin excepción).
  // Lo usa AuthService en validateUser [S-04] (Passport necesita null) y en createMunicipal [S-01] (verificar duplicado).
  async findByNameOptional(nombre: string): Promise<UsuarioMunicipal | null> {
    return await this.userRepository.findOneBy({ nombre });
  }

  // [S-34] Actualiza datos del usuario.
  async update(idUsuario: number, updateUserDto: UpdateUsuarioMunicipalDto): Promise<UsuarioMunicipal> {
    let existingUser = await this.userRepository.findOneBy({ idUsuario });
    existingUser = this.handleException(existingUser, NotFoundException, `User with ID ${idUsuario} not found`);
    Object.assign(existingUser, updateUserDto);
    return this.userRepository.save(existingUser);
  }

  // [S-35] Elimina el usuario.
  async remove(idUsuario: number) {
    let existingUser = await this.userRepository.findOneBy({ idUsuario });
    existingUser = this.handleException(existingUser, NotFoundException, `User with ID ${idUsuario} not found`);
    return this.userRepository.remove(existingUser);
  }

  // Pone el refresh_token en null al hacer logout para invalidar cualquier renovación futura.
  // Llamado desde AuthService [S-09].
  async removeRefreshToken(idUsuario: number): Promise<void> {
    if (!idUsuario) throw new Error('User ID is required to remove refresh token');
    await this.userRepository.update({ idUsuario }, { currentHashedRefreshToken: null });
  }

  // Guarda el hash del refresh_token en DB para poder validarlo en el refresh y anularlo en logout.
  // Llamado desde AuthService [S-03].
  async setCurrentRefreshToken(idUser: number, token: string) {
    const hashedToken = await bcrypt.hash(token, 10);
    await this.userRepository.update(idUser, { currentHashedRefreshToken: hashedToken });
  }
}
