import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateTipoDocumentoDto } from './dto/create-tipo-documento.dto';
import { UpdateTipoDocumentoDto } from './dto/update-tipo-documento.dto';
import { HandleService } from 'src/utils/handle.service';
import { In, Repository } from 'typeorm';
import { TipoDocumento } from './entities/tipo-documento.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { SectorMunicipalService } from 'src/sector-municipal/sector-municipal.service';

@Injectable()
export class TipoDocumentoService extends HandleService {

  constructor(
    @InjectRepository(TipoDocumento)
    private readonly tipoDocumentoRepository: Repository<TipoDocumento>,private readonly sectorMunicipalService:SectorMunicipalService
  ) {
    super();
  }

  async create(createTipoDocumentoDto: CreateTipoDocumentoDto) {
      const existingTipoDocumento = await this.tipoDocumentoRepository.findOneBy({ nombre: createTipoDocumentoDto.nombre });
        
         if(existingTipoDocumento){
          this.handleException(existingTipoDocumento,NotFoundException,`Ya existe un sector con nombre ${createTipoDocumentoDto.nombre}`);
        }

        const sector= await this.sectorMunicipalService.findOne(createTipoDocumentoDto.idSectorResponsable);
        
        if(!sector){
          this.handleException(sector,NotFoundException,`Ya no existe un sector con id ${createTipoDocumentoDto.idSectorResponsable}`);
        }
        
        
        const tipoDocumento = this.tipoDocumentoRepository.create({
          nombre: createTipoDocumentoDto.nombre,
          descripcion: createTipoDocumentoDto.descripcion,
          activo: createTipoDocumentoDto.activo,
          idSectorResponsable: sector,

        });
    
        return this.tipoDocumentoRepository.save(tipoDocumento);
  }

  findAll():Promise<TipoDocumento[]> {
   const tipoDocumento = this.tipoDocumentoRepository.find({
    relations: ['idSectorResponsable'],
   });
       return this.handleException(
         tipoDocumento,
         NotFoundException,
         'No tipos de documentos found'
       );
  }

  async findOne(idTipoDocumento: number):Promise<TipoDocumento> {
    const sector = await this.tipoDocumentoRepository.findOneBy({ idTipoDocumento,
     });
      return this.handleException(
        sector,
        NotFoundException,
        `Tipos de documentos with ID ${idTipoDocumento} not found`
      );
  }

  async findByNombre(nombre: string):Promise<TipoDocumento | null> {
    const tipoDocumento = await this.tipoDocumentoRepository.findOneBy({ nombre });
      return this.handleException(
        tipoDocumento,
        NotFoundException,
        `Tipos de documentos with name ${nombre} not found`
      );
  }

  async findAllPaged({page,limit}:{page:number,limit:number}): Promise<{ data: TipoDocumento[]; total: number }> {
    const skip = (page-1)*limit;
    const [data, total] =await this.tipoDocumentoRepository.findAndCount({
      take: limit,
      skip: skip,
      order: { nombre: 'DESC' },
      relations: ['idSectorResponsable'],
    });

    return { data, total };
  }
  async update(idTipoDocumento: number, updateTipoDocumentoDto: UpdateTipoDocumentoDto): Promise<TipoDocumento> {
    let existingSector = await this.tipoDocumentoRepository.findOneBy({ idTipoDocumento });
       existingSector = this.handleException(
         existingSector,
         NotFoundException,
         `SectorMunicipal with ID ${idTipoDocumento} not found`
       );
       Object.assign(existingSector, updateTipoDocumentoDto);
       return this.tipoDocumentoRepository.save(existingSector);
  }

  async remove(idTipoDocumento: number) {
   let existingSector = await this.tipoDocumentoRepository.findOneBy({ idTipoDocumento });
       existingSector = this.handleException(
         existingSector,
         NotFoundException,
         `SectorMunicipal with ID ${idTipoDocumento} not found`
       );
       return this.tipoDocumentoRepository.remove(existingSector);
     }
  }

