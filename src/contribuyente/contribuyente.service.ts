import { CreateContribuyenteDto } from './dto/create-contribuyente.dto';
import { UpdateContribuyenteDto } from './dto/update-contribuyente.dto';
import { HandleService } from 'src/utils/handle.service';
import { Contribuyente } from './entities/contribuyente.entity';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { Injectable, NotFoundException } from '@nestjs/common';
import * as bcrypt from 'bcrypt';

@Injectable()
export class ContribuyenteService extends HandleService {

  constructor(
    @InjectRepository(Contribuyente)
    private readonly contribuyenteRepository: Repository<Contribuyente>
  ) {
    super();
  }

  // create/save son internos: los usa AuthService para construir y persistir el contribuyente por separado
  create(data: Partial<Contribuyente>): Contribuyente {
    return this.contribuyenteRepository.create(data);
  }
  save(contribuyente: Contribuyente): Promise<Contribuyente> {
    return this.contribuyenteRepository.save(contribuyente);
  }

  // [S-29] Devuelve todos los contribuyentes.
  async findAll({page,limit}:{page:number,limit:number}): Promise<{ data: Contribuyente[]; total: number }> {
     const skip = (page-1)*limit;

     const [data, total] =await this.contribuyenteRepository.findAndCount({
      take: limit,
      skip: skip,
      order: { fechaRegistro: 'DESC' }
    });
    return { data, total };
  }

  // [S-28] Busca por DNI exacto. Retorna null si no existe (sin excepción).
  // Lo usa AuthService.validateContribuyente donde null es el resultado esperado si no existe.
  async findByDni(dni: string): Promise<Contribuyente | null> {
    return this.contribuyenteRepository.findOneBy({ dni });
  }

 

    async findBySlug(slug: string): Promise<Contribuyente | null> {
      const user = await this.contribuyenteRepository.findOne({
        where: { slug },
      });
      return this.handleException(user, NotFoundException, `Contribuyente with slug ${slug} not found`);

    }

  // [S-27] Búsqueda parcial por DNI. Limita a 20 resultados para el autocomplete.
  async buscarContribuyentes(search?: string): Promise<Contribuyente[]> {
    const query = this.contribuyenteRepository.createQueryBuilder('c');

    if (search?.trim()) {
      const words = search.trim().split(/\s+/);
      query.where(
        words.map((_, i) => `(LOWER(c.dni) LIKE :word${i})`).join(' OR '),
        Object.fromEntries(words.map((word, i) => [`word${i}`, `%${word.toLowerCase()}%`]))
      );
    }

    return query.limit(20).getMany();
  }

  // findOne es interno: lo usan AuthService y MailService donde el contribuyente DEBE existir.
  // A diferencia de findByDni, este sí lanza NotFoundException.
  async findOne(idContribuyente: number): Promise<Contribuyente> {
    const contribuyente = await this.contribuyenteRepository.findOneBy({ idContribuyente });
    return this.handleException(contribuyente, NotFoundException, `Contribuyente with ID ${idContribuyente} not found`);
  }

  // Activa la cuenta y pone el token en null para que el link de activación no se reutilice.
  // Llamado desde AuthService [S-11].
  async activateContribuyente(contribuyente: Contribuyente, hashedPassword: string): Promise<void> {
    contribuyente.activo = true;
    contribuyente.password = hashedPassword;
    contribuyente.activationToken = null; // Invalida el link de activación
    await this.save(contribuyente);
  }

  // Busca un contribuyente inactivo con ese id y ese token exacto.
  // La combinación de las 3 condiciones evita activar cuentas ya activas o con token incorrecto.
  // Llamado desde AuthService [S-11].
  async finOneInactiveByIdAndActivationToken(id: number, code: string): Promise<Contribuyente | null> {
    return this.contribuyenteRepository.findOneBy({ idContribuyente: id, activationToken: code, activo: false });
  }

  // Guarda el hash del refresh_token en DB para poder validarlo en el refresh y anularlo en logout.
  // Llamado desde AuthService [S-05].
  async setCurrentRefreshToken(idContribuyente: number, token: string) {
    const hashedToken = await bcrypt.hash(token, 10);
    await this.contribuyenteRepository.update(idContribuyente, { currentHashedRefreshToken: hashedToken });
  }

  // Pone el refresh_token en null al hacer logout para invalidar cualquier renovación futura.
  // Llamado desde AuthService [S-10].
  async removeRefreshToken(idContribuyente: number): Promise<void> {
    if (!idContribuyente) throw new Error('Se requiere un ID para eliminar el refresh token');
    await this.contribuyenteRepository.update({ idContribuyente }, { currentHashedRefreshToken: null });
  }

  // [S-30] Actualiza datos del contribuyente. Aún no se usa en el sistema.
  async update(idContribuyente: number, updateContribuyenteDto: UpdateContribuyenteDto): Promise<Contribuyente> {
    let existingContribuyente = await this.contribuyenteRepository.findOneBy({ idContribuyente });
    existingContribuyente = this.handleException(existingContribuyente, NotFoundException, `Contribuyente with ID ${idContribuyente} not found`);
    Object.assign(existingContribuyente, updateContribuyenteDto);
    return this.contribuyenteRepository.save(existingContribuyente);
  }

    async updateBySlug(slug: string, updateContribuyenteDto: UpdateContribuyenteDto): Promise<Contribuyente> {
      let existingContribuyente = await this.contribuyenteRepository.findOneBy({ slug });
      existingContribuyente = this.handleException(existingContribuyente, NotFoundException, `Contribuyente with slug ${slug} not found`);
      Object.assign(existingContribuyente, updateContribuyenteDto);
      return this.contribuyenteRepository.save(existingContribuyente);

    }

  // [S-31] Elimina el contribuyente. Aún no se usa en el sistema.
  async remove(idContribuyente: number) {
    let existingContribuyente = await this.contribuyenteRepository.findOneBy({ idContribuyente });
    existingContribuyente = this.handleException(existingContribuyente, NotFoundException, `Contribuyente with ID ${idContribuyente} not found`);
    return this.contribuyenteRepository.remove(existingContribuyente);
  }

  async findByEmail(email: string): Promise<Contribuyente | null> {
  return this.contribuyenteRepository.findOneBy({ email });
}

async setResetPasswordToken(idContribuyente: number, hashedToken: string, expires: Date): Promise<void> {
  await this.contribuyenteRepository.update(idContribuyente, {
    reset_password_token: hashedToken,
    reset_password_expires: expires,
  });
}

async clearResetPasswordToken(idContribuyente: number, hashedPassword: string): Promise<void> {
  await this.contribuyenteRepository.update(idContribuyente, {
    password: hashedPassword,
    reset_password_token: null,
    reset_password_expires: null,
  });
}

findByResetToken(hashedToken: string) {
  return this.contribuyenteRepository.findOne({ where: { reset_password_token: hashedToken } });
}
}
