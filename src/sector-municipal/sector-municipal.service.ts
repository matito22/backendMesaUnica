import { ConflictException, Injectable, NotFoundException } from '@nestjs/common';
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




    
    
// ✅ CORRECTO — usar ConflictException y handleDuplicate, o simplemente throw directo
async create(createSectorMunicipalDto: CreateSectorMunicipalDto): Promise<SectorMunicipal> {
    const existente = await this.sectorMunicipalRepository.findOneBy({ 
        nombre: createSectorMunicipalDto.nombre 
    });
    
    if (existente) {
        throw new ConflictException(`Ya existe un sector con nombre "${createSectorMunicipalDto.nombre}"`);
    }
    
    const sector = this.sectorMunicipalRepository.create(createSectorMunicipalDto);
    return this.sectorMunicipalRepository.save(sector);
}
      

  findAll(): Promise<SectorMunicipal[]> {
    const sectores = this.sectorMunicipalRepository.find();
    return this.handleException(
      sectores,
      NotFoundException,
      'No sectores found'
    );
    
  }

async findOne(idSector: number): Promise<SectorMunicipal> {
  const sector = await this.sectorMunicipalRepository.findOneBy({ idSector });
  return this.handleException(
    sector,
    NotFoundException,
    `SectorMunicipal with ID ${idSector} not found`
  );
}


  async update(id: number, updateSectorMunicipalDto: UpdateSectorMunicipalDto): Promise<SectorMunicipal> {
    let existingSector = await this.sectorMunicipalRepository.findOneBy({ idSector: id });
    existingSector = this.handleException(
      existingSector,
      NotFoundException,
      `SectorMunicipal with ID ${id} not found`
    );
    Object.assign(existingSector, updateSectorMunicipalDto);
    return this.sectorMunicipalRepository.save(existingSector);
  }

  async remove(id: number) {
    let existingSector = await this.sectorMunicipalRepository.findOneBy({ idSector: id });
    existingSector = this.handleException(
      existingSector,
      NotFoundException,
      `SectorMunicipal with ID ${id} not found`
    );
    return this.sectorMunicipalRepository.remove(existingSector);
  }
}
