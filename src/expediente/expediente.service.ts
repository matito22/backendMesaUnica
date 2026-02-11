import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { CreateExpedienteDto } from './dto/create-expediente.dto';
import { UpdateExpedienteDto } from './dto/update-expediente.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Expediente } from './entities/expediente.entity';
import { HandleService } from '../utils/handle.service';

@Injectable()
export class ExpedienteService extends HandleService {

  constructor(
    @InjectRepository(Expediente)
    private readonly expedienteRepository: Repository<Expediente>
  ) {
    super();
  }

  async create(createExpedienteDto: CreateExpedienteDto): Promise<Expediente> {
    
    const existingExpediente = await this.expedienteRepository.findOneBy({ 
      numeroGde: createExpedienteDto.numeroGde 
    });
    
    if (existingExpediente) {
      this.handleException(
        existingExpediente, 
        ConflictException, 
        `Ya existe un expediente con número GDE ${createExpedienteDto.numeroGde}`
      );
    }
    
    const expediente = this.expedienteRepository.create({
      idContribuyente: createExpedienteDto.idContribuyente,
      numeroGde: createExpedienteDto.numeroGde,
      estado: createExpedienteDto.estado,
    });

    return this.expedienteRepository.save(expediente);
  }

  findAll(): Promise<Expediente[]> {
    const expedientes = this.expedienteRepository.find({
      relations: ['idContribuyente']
    });
    return this.handleException(
      expedientes,
      NotFoundException,
      'No se encontraron expedientes'
    );
  }

  async findOne(idExpediente: number): Promise<Expediente> {
    const expediente = await this.expedienteRepository.findOne({
      where: { idExpediente },
      relations: ['idContribuyente']
    });
    return this.handleException(
      expediente,
      NotFoundException,
      `Expediente con ID ${idExpediente} no encontrado`
    );
  }

  async findByNumeroGde(numeroGde: string): Promise<Expediente> {
    const expediente = await this.expedienteRepository.findOne({
      where: { numeroGde },
      relations: ['idContribuyente']
    });
    return this.handleException(
      expediente,
      NotFoundException,
      `Expediente con número GDE ${numeroGde} no encontrado`
    );
  }

  async findByContribuyente(idContribuyente: number): Promise<Expediente[]> {
    const expedientes = await this.expedienteRepository.find({
      where: { idContribuyente },
      relations: ['idContribuyente']
    });
    return this.handleException(
      expedientes,
      NotFoundException,
      `No se encontraron expedientes para el contribuyente ${idContribuyente}`
    );
  }

  async update(id: number, updateExpedienteDto: UpdateExpedienteDto): Promise<Expediente> {
    let existingExpediente = await this.expedienteRepository.findOneBy({ idExpediente: id });
    existingExpediente = this.handleException(
      existingExpediente,
      NotFoundException,
      `Expediente con ID ${id} no encontrado`
    );

    // Si se está actualizando el número GDE, verificar que no exista
    if (updateExpedienteDto.numeroGde && updateExpedienteDto.numeroGde !== existingExpediente.numeroGde) {
      const duplicateGde = await this.expedienteRepository.findOneBy({ 
        numeroGde: updateExpedienteDto.numeroGde 
      });
      if (duplicateGde) {
        this.handleException(
          duplicateGde,
          ConflictException,
          `Ya existe un expediente con número GDE ${updateExpedienteDto.numeroGde}`
        );
      }
    }

    Object.assign(existingExpediente, updateExpedienteDto);
    return this.expedienteRepository.save(existingExpediente);
  }

  async remove(id: number) {
    let existingExpediente = await this.expedienteRepository.findOneBy({ idExpediente: id });
    existingExpediente = this.handleException(
      existingExpediente,
      NotFoundException,
      `Expediente con ID ${id} no encontrado`
    );
    return this.expedienteRepository.remove(existingExpediente);
  }
}