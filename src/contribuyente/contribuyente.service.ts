
import { CreateContribuyenteDto } from './dto/create-contribuyente.dto';
import { UpdateContribuyenteDto } from './dto/update-contribuyente.dto';
import { HandleService } from 'src/utils/handle.service';
import { Contribuyente } from './entities/contribuyente.entity';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { Injectable, NotFoundException } from '@nestjs/common';

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
