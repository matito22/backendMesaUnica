
import { CreateContribuyenteDto } from './dto/create-contribuyente.dto';
import { UpdateContribuyenteDto } from './dto/update-contribuyente.dto';
import { HandleService } from 'src/utils/handle.service';
import { Contribuyente } from './entities/contribuyente.entity';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { Injectable, NotFoundException } from '@nestjs/common';
import * as bcrypt from 'bcrypt';

@Injectable()
export class ContribuyenteService  extends HandleService {
  
  constructor(
    @InjectRepository(Contribuyente)
    private readonly contribuyenteRepository: Repository<Contribuyente>
  ) {
    super();
  }
  
   create(data: Partial<Contribuyente>): Contribuyente {
     return this.contribuyenteRepository.create(data);
   }
 
   save(contribuyente: Contribuyente): Promise<Contribuyente> {
     return this.contribuyenteRepository.save(contribuyente);
   }

 findAll():Promise<Contribuyente[]> {
   const contribuyente = this.contribuyenteRepository.find();
       return this.handleException(
         contribuyente,
         NotFoundException,
         'No Contribuyentes found'
       );
  }

  async findOne(idContribuyente: number):Promise<Contribuyente> {
    const sector = await this.contribuyenteRepository.findOneBy({ idContribuyente });
      return this.handleException(
        sector,
        NotFoundException,
        `Contribuyente with ID ${idContribuyente} not found`
      );
  }


async findByDni(dni: string): Promise<Contribuyente | null> {
  // NO uses handleException aquí, solo retorna null si no existe
  return this.contribuyenteRepository.findOneBy({ dni });
}

async findByEmailOptional(email: string): Promise<Contribuyente | null> {
  return this.contribuyenteRepository.findOneBy({ email });
}
  

  async update(idContribuyente: number, updateContribuyenteDto: UpdateContribuyenteDto): Promise<Contribuyente> {
    let existingContribuyente = await this.contribuyenteRepository.findOneBy({ idContribuyente });
       existingContribuyente = this.handleException(
         existingContribuyente,
         NotFoundException,
         `Contribuyente with ID ${idContribuyente} not found`
       );
       Object.assign(existingContribuyente, updateContribuyenteDto);
       return this.contribuyenteRepository.save(existingContribuyente);
  }

  async remove(idContribuyente: number) {
   let existingContribuyente = await this.contribuyenteRepository.findOneBy({ idContribuyente });
       existingContribuyente = this.handleException(
         existingContribuyente,
         NotFoundException,
         `Contribuyente with ID ${idContribuyente} not found`
       );
       return this.contribuyenteRepository.remove(existingContribuyente);
     }


async activateContribuyente(contribuyente: Contribuyente, hashedPassword: string): Promise<void> {
  contribuyente.activo = true;
  contribuyente.password = hashedPassword;    // ✅ Reemplaza la temporal
  contribuyente.activationToken = null;       // ✅ Invalida el token para que no se reutilice
  await this.save(contribuyente);
}
async finOneInactiveByIdAndActivationToken(id: number, code:string): Promise<Contribuyente | null> {
  return this.contribuyenteRepository.findOneBy({ idContribuyente: id, activationToken:code, activo: false });
}

async setCurrentRefreshToken(idContribuyente: number, token: string) {
  const hashedToken = await bcrypt.hash(token, 10); 
  await this.contribuyenteRepository.update(idContribuyente, { currentHashedRefreshToken: hashedToken });
}

async removeRefreshToken(idContribuyente: number): Promise<void> {
  if (!idContribuyente) {
    throw new Error('Contribuyente ID is required to remove refresh token');
  }

  await this.contribuyenteRepository.update(
    { idContribuyente },
    { currentHashedRefreshToken: null }
  );
}


 async buscarContribuyentes(search?: string): Promise<Contribuyente[]> {
    const query = this.contribuyenteRepository.createQueryBuilder('c');

    if (search?.trim()) {
      const words = search.trim().split(/\s+/);
      query.where(
        words
          .map((_, i) => `(LOWER(c.nombre) LIKE :word${i} OR c.dni LIKE :word${i})`)
          .join(' OR '),
        Object.fromEntries(words.map((word, i) => [`word${i}`, `%${word.toLowerCase()}%`]))
      );
    }

    return query.limit(20).getMany();
  }

}
