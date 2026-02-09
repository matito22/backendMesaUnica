import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateSectorMunicipalDto } from './dto/create-sector-municipal.dto';
import { UpdateSectorMunicipalDto } from './dto/update-sector-municipal.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { SectorMunicipal } from './entities/sector-municipal.entity';
import { HandleService } from '../utils/handle.service';

@Injectable()
export class SectorMunicipalService  extends HandleService {

  constructor(
      @InjectRepository(SectorMunicipal)
  private readonly sectorMunicipalRepository: Repository<SectorMunicipal>

  ) {
    super();
  }



  async create(createSectorMunicipalDto: CreateSectorMunicipalDto): Promise<SectorMunicipal> {

    const existingSectorMunicipal = await this.sectorMunicipalRepository.findOneBy({ nombre: createSectorMunicipalDto.nombre });
    
     if(existingSectorMunicipal){
      this.handleException(existingSectorMunicipal,NotFoundException,`Ya existe un sector con nombre ${createSectorMunicipalDto.nombre}`);
    }
    
    
    const sectorMunicipal = this.sectorMunicipalRepository.create({
      nombre: createSectorMunicipalDto.nombre,
      activo: createSectorMunicipalDto.activo,
    });

    return this.sectorMunicipalRepository.save(sectorMunicipal);
  }
    
      



  findAll() {
    return `This action returns all sectorMunicipal`;
  }

 // sector-municipal.service.ts
async findOne(idSector: number): Promise<SectorMunicipal> {
  const sector = await this.sectorMunicipalRepository.findOneBy({ idSector });
  if (!sector) {
    throw new NotFoundException(`SectorMunicipal with ID ${idSector} not found`);
  }
  return sector;
}


  update(id: number, updateSectorMunicipalDto: UpdateSectorMunicipalDto) {
    return `This action updates a #${id} sectorMunicipal`;
  }

  remove(id: number) {
    return `This action removes a #${id} sectorMunicipal`;
  }
}
