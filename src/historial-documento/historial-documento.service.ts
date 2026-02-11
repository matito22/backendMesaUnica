import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateHistorialDocumentoDto } from './dto/create-historial-documento.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { HistorialDocumento } from './entities/historial-documento.entity';
import { HandleService } from '../utils/handle.service';
import { UpdateHistorialDocumentoDto } from './dto/update-historial-documento.dto';

@Injectable()
export class HistorialDocumentoService extends HandleService {

  constructor(
    @InjectRepository(HistorialDocumento)
    private readonly historialDocumentoRepository: Repository<HistorialDocumento>
  ) {
    super();
  }

  async create(createHistorialDocumentoDto: CreateHistorialDocumentoDto): Promise<HistorialDocumento> {
    const historial = this.historialDocumentoRepository.create({
      idDocumento: createHistorialDocumentoDto.idDocumento,
      idUsuarioActor: createHistorialDocumentoDto.idUsuarioActor,
      estadoAnterior: createHistorialDocumentoDto.estadoAnterior,
      estadoNuevo: createHistorialDocumentoDto.estadoNuevo,
      observacion: createHistorialDocumentoDto.observacion,
    });

    return this.historialDocumentoRepository.save(historial);
  }

  findAll(): Promise<HistorialDocumento[]> {
    const historiales = this.historialDocumentoRepository.find({
      relations: ['idDocumento', 'idUsuarioActor'],
      order: { fechaCambio: 'DESC' }
    });
    return this.handleException(
      historiales,
      NotFoundException,
      'No se encontraron registros de historial'
    );
  }

  async findOne(idHistorial: number): Promise<HistorialDocumento> {
    const historial = await this.historialDocumentoRepository.findOne({
      where: { idHistorial },
      relations: ['idDocumento', 'idUsuarioActor']
    });
    return this.handleException(
      historial,
      NotFoundException,
      `Historial con ID ${idHistorial} no encontrado`
    );
  }

  async findByDocumento(idDocumento: number): Promise<HistorialDocumento[]> {
    const historiales = await this.historialDocumentoRepository.find({
      where: { idDocumento },
      relations: ['idUsuarioActor'],
      order: { fechaCambio: 'DESC' }
    });
    return this.handleException(
      historiales,
      NotFoundException,
      `No se encontró historial para el documento ${idDocumento}`
    );
  }

  async findByUsuario(idUsuarioActor: number): Promise<HistorialDocumento[]> {
    const historiales = await this.historialDocumentoRepository.find({
      where: { idUsuarioActor },
      relations: ['idDocumento'],
      order: { fechaCambio: 'DESC' }
    });
    return this.handleException(
      historiales,
      NotFoundException,
      `No se encontró historial para el usuario ${idUsuarioActor}`
    );
  }


  async update(id: number, updateHistorialDocumentoDto: UpdateHistorialDocumentoDto): Promise<HistorialDocumento> {
  let existingHistorial = await this.historialDocumentoRepository.findOneBy({ idHistorial: id });
  existingHistorial = this.handleException(
    existingHistorial,
    NotFoundException,
    `Historial con ID ${id} no encontrado`
  );
  
  Object.assign(existingHistorial, updateHistorialDocumentoDto);
  return this.historialDocumentoRepository.save(existingHistorial);
}

  async remove(id: number) {
    let existingHistorial = await this.historialDocumentoRepository.findOneBy({ idHistorial: id });
    existingHistorial = this.handleException(
      existingHistorial,
      NotFoundException,
      `Historial con ID ${id} no encontrado`
    );
    return this.historialDocumentoRepository.remove(existingHistorial);
  }
}