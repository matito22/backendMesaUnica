import { Injectable, NotFoundException } from '@nestjs/common';
import { UpdateUsuarioMunicipalDto } from './dto/update-usuario-municipal.dto';
import { Repository } from 'typeorm';
import { UsuarioMunicipal } from './entities/usuario-municipal.entity';
import { HandleService } from '../utils/handle.service';
import * as bcrypt from 'bcrypt';
import { InjectRepository } from '@nestjs/typeorm';
import { SectorMunicipal } from 'src/sector-municipal/entities/sector-municipal.entity';

@Injectable()
export class UsuarioMunicipalService extends HandleService {

  constructor(
    @InjectRepository(UsuarioMunicipal)
    private userRepository: Repository<UsuarioMunicipal>,
    @InjectRepository(SectorMunicipal)
    private sectorMunicipalRepository: Repository<SectorMunicipal>
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
  async findAll({page,limit}:{page:number,limit:number}):  Promise<{ data: UsuarioMunicipal[]; total: number }> {
    const skip = (page-1)*limit;
    const [data, total] =await this.userRepository.findAndCount({
      relations: ['sector'],
      take: limit,
      skip: skip,
      order: { nombre: 'ASC' }
    });
    return { data, total };

  }

  // [S-33] Devuelve un usuario por id. Lo usa también AuthService [S-07] al refrescar el token.
  async findOne(idUsuario: number): Promise<UsuarioMunicipal> {
    const user = await this.userRepository.findOne({
      where: { idUsuario },
      relations: ['sector'],
    });
    return this.handleException(user, NotFoundException, `User with ID ${idUsuario} not found`);
  }

  async findBySlug(slug: string): Promise<UsuarioMunicipal | null> {
    const user = await this.userRepository.findOne({
      where: { slug },
      relations: ['sector'],
    });
    return this.handleException(user, NotFoundException, `User with slug ${slug} not found`);

  }
  // findByName lanza excepción si no existe. Para cuando el usuario YA tiene que existir.
  async findByName(nombre: string): Promise<UsuarioMunicipal | null> {
   return await this.userRepository.findOneBy({ nombre });
    
  }

  async findByEmail(email: string): Promise<UsuarioMunicipal | null> {
    return await this.userRepository.findOneBy({ email });
   
  }

  // findByNameOptional retorna null si no existe (sin excepción).
  // Lo usa AuthService en validateUser [S-04] (Passport necesita null) y en createMunicipal [S-01] (verificar duplicado).
  async findByNameOptional(nombre: string): Promise<UsuarioMunicipal | null> {
    return await this.userRepository.findOneBy({ nombre });
  }

  // [S-34] Actualiza datos del usuario.
  async updateBySlug(slug: string, updateUserDto: UpdateUsuarioMunicipalDto): Promise<UsuarioMunicipal> {
    let existingUser = await this.userRepository.findOneBy({ slug });
    existingUser = this.handleException(existingUser, NotFoundException, `User with slug ${slug} not found`);

    const { sector, ...restoDto } = updateUserDto;
    Object.assign(existingUser, restoDto);

    if (sector) {
      const sectorEntity = await this.sectorMunicipalRepository.findOneBy({ idSector: sector });
      if (!sectorEntity) throw new NotFoundException(`Sector with ID ${sector} not found`);
      existingUser.sector = sectorEntity;
    }

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


    // Busca un contribuyente inactivo con ese id y ese token exacto.
    // La combinación de las 3 condiciones evita activar cuentas ya activas o con token incorrecto.
    async finOneInactiveByIdAndActivationToken(id: number, code: string): Promise<UsuarioMunicipal | null> {
      return this.userRepository.findOneBy({ idUsuario: id, activationToken: code, activo: false });
    }

      // Activa la cuenta y pone el token en null para que el link de activación no se reutilice.
      // Llamado desde AuthService [S-12].
      async activateUsuario(usuario: UsuarioMunicipal, hashedPassword: string): Promise<void> {
        usuario.activo = true;
        usuario.password = hashedPassword;
        usuario.activationToken = null; // Invalida el link de activación
        await this.save(usuario);
      }
   
}
