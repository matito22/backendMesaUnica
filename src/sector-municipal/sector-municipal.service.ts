import { ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { CreateSectorMunicipalDto } from './dto/create-sector-municipal.dto';
import { UpdateSectorMunicipalDto } from './dto/update-sector-municipal.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { SectorMunicipal } from './entities/sector-municipal.entity';
import { HandleService } from '../utils/handle.service';

@Injectable()
export class SectorMunicipalService extends HandleService {

  constructor(
    @InjectRepository(SectorMunicipal)
    private readonly sectorMunicipalRepository: Repository<SectorMunicipal>
  ) {
    super();
  }

  // [S-43] Crea un sector verificando que el nombre no esté duplicado.
  async create(createSectorMunicipalDto: CreateSectorMunicipalDto): Promise<SectorMunicipal> {
    const existente = await this.sectorMunicipalRepository.findOneBy({ nombre: createSectorMunicipalDto.nombre });
    if (existente) throw new ConflictException(`Ya existe un sector con nombre "${createSectorMunicipalDto.nombre}"`);
    const sector = this.sectorMunicipalRepository.create(createSectorMunicipalDto);
    return this.sectorMunicipalRepository.save(sector);
  }

  // [S-44] Devuelve todos los sectores.
  findAll(): Promise<SectorMunicipal[]> {
    const sectores = this.sectorMunicipalRepository.find();
    return this.handleException(sectores, NotFoundException, 'No sectores found');
  }

  async findAllPaged({page,limit}:{page:number,limit:number}): Promise<{ data: SectorMunicipal[]; total: number }> {
    const skip = (page-1)*limit;
    const [data, total] =await this.sectorMunicipalRepository.findAndCount({
      take: limit,
      skip: skip,
      order: { nombre: 'DESC' }
    });
    return { data, total };

  }

  // [S-45] Devuelve un sector por id. Lo usa también AuthService [S-01] para determinar el rol del usuario.
  async findOne(idSector: number): Promise<SectorMunicipal> {
    const sector = await this.sectorMunicipalRepository.findOneBy({ idSector });
    return this.handleException(sector, NotFoundException, `SectorMunicipal with ID ${idSector} not found`);
  }

  async findByName(nombre: string): Promise<SectorMunicipal | null> {
    const sector = await this.sectorMunicipalRepository.findOneBy({ nombre });
    return this.handleException(sector, NotFoundException, `SectorMunicipal with name ${nombre} not found`);
  }

  // [S-46] Actualiza un sector.
  async update(id: number, updateSectorMunicipalDto: UpdateSectorMunicipalDto): Promise<SectorMunicipal> {
    let existingSector = await this.sectorMunicipalRepository.findOneBy({ idSector: id });
    existingSector = this.handleException(existingSector, NotFoundException, `SectorMunicipal with ID ${id} not found`);
    Object.assign(existingSector, updateSectorMunicipalDto);
    return this.sectorMunicipalRepository.save(existingSector);
  }

  // [S-47] Elimina un sector.
  async remove(id: number) {
    let existingSector = await this.sectorMunicipalRepository.findOneBy({ idSector: id });
    existingSector = this.handleException(existingSector, NotFoundException, `SectorMunicipal with ID ${id} not found`);
    return this.sectorMunicipalRepository.remove(existingSector);
  }
}
