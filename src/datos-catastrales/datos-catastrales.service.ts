import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { DatosCatastrales } from './entities/datos-catastrales.entity';
import { CreateDatosCatastralesDto } from './dto/create-datos-catastrales.dto';
import { UpdateDatosCatastralesDto } from './dto/update-datos-catastrales.dto';

@Injectable()
export class DatosCatastralesService {
  constructor(
    @InjectRepository(DatosCatastrales)
    private readonly datosRepo: Repository<DatosCatastrales>,
  ) {}

   create(dto: CreateDatosCatastralesDto): Promise<DatosCatastrales> {
    const datosCatastrales = this.datosRepo.create(dto as any);
    return this.datosRepo.save(datosCatastrales) as unknown as Promise<DatosCatastrales>;
  }

  async findOne(id: number): Promise<DatosCatastrales> {
    const e = await this.datosRepo.findOne({ where: { idDatosCatastrales: id } });
    if (!e) throw new NotFoundException('Datos catastrales no encontrados');
    return e;
  }

  async update(id: number, dto: UpdateDatosCatastralesDto): Promise<DatosCatastrales> {
    let existing = await this.datosRepo.findOne({ where: { idDatosCatastrales: id } });
    if (!existing) throw new NotFoundException('Datos catastrales no encontrados');
    Object.assign(existing, dto);
    return this.datosRepo.save(existing);
  }

  async remove(id: number) {
    const existing = await this.datosRepo.findOne({ where: { idDatosCatastrales: id } });
    if (!existing) throw new NotFoundException('Datos catastrales no encontrados');
    return this.datosRepo.remove(existing);
  }
}
