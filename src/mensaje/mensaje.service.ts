import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateMensajeDto } from './dto/create-mensaje.dto';
import { UpdateMensajeDto } from './dto/update-mensaje.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Mensaje } from './entities/mensaje.entity';
import { HandleService } from '../utils/handle.service';

@Injectable()
export class MensajeService extends HandleService {

  constructor(
    @InjectRepository(Mensaje)
    private readonly mensajeRepository: Repository<Mensaje>
  ) {
    super();
  }

  async create(createMensajeDto: CreateMensajeDto): Promise<Mensaje> {
    const mensaje = this.mensajeRepository.create({
      idExpediente: createMensajeDto.idExpediente,
      idUsuarioMunicipal: createMensajeDto.idUsuarioMunicipal,
      contenido: createMensajeDto.contenido,
      leido: createMensajeDto.leido ?? false,
    });

    return this.mensajeRepository.save(mensaje);
  }

  findAll(): Promise<Mensaje[]> {
    const mensajes = this.mensajeRepository.find({
      relations: ['idExpediente', 'idUsuarioMunicipal'],
      order: { fechaEnvio: 'DESC' }
    });
    return this.handleException(
      mensajes,
      NotFoundException,
      'No se encontraron mensajes'
    );
  }

  async findOne(idMensaje: number): Promise<Mensaje> {
    const mensaje = await this.mensajeRepository.findOne({
      where: { idMensaje },
      relations: ['idExpediente', 'idUsuarioMunicipal']
    });
    return this.handleException(
      mensaje,
      NotFoundException,
      `Mensaje con ID ${idMensaje} no encontrado`
    );
  }

  async findByExpediente(idExpediente: number): Promise<Mensaje[]> {
    const mensajes = await this.mensajeRepository.find({
      where: { idExpediente },
      relations: ['idUsuarioMunicipal'],
      order: { fechaEnvio: 'ASC' }
    });
    return this.handleException(
      mensajes,
      NotFoundException,
      `No se encontraron mensajes para el expediente ${idExpediente}`
    );
  }

  async findNoLeidos(idExpediente?: number): Promise<Mensaje[]> {
    const whereCondition: any = { leido: false };
    if (idExpediente) {
      whereCondition.idExpediente = idExpediente;
    }

    const mensajes = await this.mensajeRepository.find({
      where: whereCondition,
      relations: ['idExpediente', 'idUsuarioMunicipal'],
      order: { fechaEnvio: 'DESC' }
    });
    return mensajes;
  }

  async marcarComoLeido(idMensaje: number): Promise<Mensaje> {
    let mensaje = await this.mensajeRepository.findOneBy({ idMensaje });
    mensaje = this.handleException(
      mensaje,
      NotFoundException,
      `Mensaje con ID ${idMensaje} no encontrado`
    );

    mensaje.leido = true;
    return this.mensajeRepository.save(mensaje);
  }

  async marcarTodosComoLeidos(idExpediente: number): Promise<void> {
    await this.mensajeRepository.update(
      { idExpediente, leido: false },
      { leido: true }
    );
  }

  async update(id: number, updateMensajeDto: UpdateMensajeDto): Promise<Mensaje> {
    let existingMensaje = await this.mensajeRepository.findOneBy({ idMensaje: id });
    existingMensaje = this.handleException(
      existingMensaje,
      NotFoundException,
      `Mensaje con ID ${id} no encontrado`
    );

    Object.assign(existingMensaje, updateMensajeDto);
    return this.mensajeRepository.save(existingMensaje);
  }

  async remove(id: number) {
    let existingMensaje = await this.mensajeRepository.findOneBy({ idMensaje: id });
    existingMensaje = this.handleException(
      existingMensaje,
      NotFoundException,
      `Mensaje con ID ${id} no encontrado`
    );
    return this.mensajeRepository.remove(existingMensaje);
  }
}