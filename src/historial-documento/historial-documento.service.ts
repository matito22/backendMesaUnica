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
      idDocumento:    createHistorialDocumentoDto.idDocumento,
      idUsuarioActor: createHistorialDocumentoDto.idUsuarioActor,
      estadoAnterior: createHistorialDocumentoDto.estadoAnterior,
      estadoNuevo:    createHistorialDocumentoDto.estadoNuevo,
      observacion:    createHistorialDocumentoDto.observacion,
    });
    return this.historialDocumentoRepository.save(historial);
  }

  findAll(): Promise<HistorialDocumento[]> {
    // ✅ Nombres de relación corregidos: 'documento' y 'usuarioActor'
    return this.historialDocumentoRepository.find({
      relations: ['documento', 'usuarioActor'],
      order: { fechaCambio: 'DESC' }
    });
  }

  async findOne(idHistorial: number): Promise<HistorialDocumento> {
    const historial = await this.historialDocumentoRepository.findOne({
      where: { idHistorial },
      relations: ['documento', 'usuarioActor'],
    });
    return this.handleException(
      historial,
      NotFoundException,
      `Historial con ID ${idHistorial} no encontrado`
    );
  }

  async findByDocumento(idDocumento: number): Promise<HistorialDocumento[]> {
    // ✅ where por la columna FK (idDocumento), no por la relación
    return this.historialDocumentoRepository.find({
      where: { idDocumento },
      relations: ['usuarioActor'],
      order: { fechaCambio: 'DESC' }
    });
  }

  async findByUsuario(idUsuarioActor: number): Promise<HistorialDocumento[]> {
    return this.historialDocumentoRepository.find({
      where: { idUsuarioActor },
      relations: ['documento'],
      order: { fechaCambio: 'DESC' }
    });
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