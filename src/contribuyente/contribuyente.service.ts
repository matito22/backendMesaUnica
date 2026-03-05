
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


 async findByDni(dni: string): Promise<Contribuyente | null> {
    return this.contribuyenteRepository.findOneBy({ dni });
  }


 async buscarContribuyentes(search?: string): Promise<Contribuyente[]> {
    const query = this.contribuyenteRepository.createQueryBuilder('c');

    if (search?.trim()) {
      const words = search.trim().split(/\s+/);
      query.where(
        words
          .map((_, i) => `(LOWER(c.dni) LIKE :word${i})`)
          .join(' OR '),
        Object.fromEntries(words.map((word, i) => [`word${i}`, `%${word.toLowerCase()}%`]))
      );
    }

    return query.limit(20).getMany();
  }


//Se usa internamente en el backend para buscar un contribuyente por id
  async findOne(idContribuyente: number):Promise<Contribuyente> {
    const contribuyente = await this.contribuyenteRepository.findOneBy({ idContribuyente });
      return this.handleException(
        contribuyente,
        NotFoundException,
        `Contribuyente with ID ${idContribuyente} not found`
      );
  }



//FUNCIONES INTERNAS UTILIZADAS EN AUTHSERVICE PARA ACTIVAR UN CONTRIBUYENTE
async activateContribuyente(contribuyente: Contribuyente, hashedPassword: string): Promise<void> {
  contribuyente.activo = true;
  contribuyente.password = hashedPassword;   
  contribuyente.activationToken = null;       // Invalida el token para que no se reutilice
  await this.save(contribuyente);
}

async finOneInactiveByIdAndActivationToken(id: number, code:string): Promise<Contribuyente | null> {
  return this.contribuyenteRepository.findOneBy({ idContribuyente: id, activationToken:code, activo: false });
}



//UTILIZADO EN EL LOGIN DE AUTHSERVICE PARA EL CONTRIBUYENTE, GUARDANDO EL REFRESH  TOKEN EN LA BASE DE DATOS
async setCurrentRefreshToken(idContribuyente: number, token: string) {
  const hashedToken = await bcrypt.hash(token, 10); 
  await this.contribuyenteRepository.update(idContribuyente, { currentHashedRefreshToken: hashedToken });
}

//UTILIZADO EN LOGOUT DE AUTHSERVICE PARA EL CONTRIBUYENTE
async removeRefreshToken(idContribuyente: number): Promise<void> {
  if (!idContribuyente) {
    throw new Error('Se requiere un ID para eliminar el refresh token');
  }

  await this.contribuyenteRepository.update(
    { idContribuyente },
    { currentHashedRefreshToken: null }
  );
}


 //AUN NO SE UTILIZAN EN EL SISTEMA
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



}
