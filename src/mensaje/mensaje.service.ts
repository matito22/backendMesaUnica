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

  // [S-36] Crea un mensaje. leido empieza en false porque aún no fue visto.
  async create(createMensajeDto: CreateMensajeDto): Promise<Mensaje> {
    const mensaje = this.mensajeRepository.create({
      idExpediente: createMensajeDto.idExpediente,
      idUsuarioMunicipal: createMensajeDto.idUsuarioMunicipal,
      contenido: createMensajeDto.contenido,
      leido: createMensajeDto.leido ?? false,
    });
    return this.mensajeRepository.save(mensaje);
  }

  // [S-37] Devuelve todos los mensajes con sus relaciones.
  findAll(): Promise<Mensaje[]> {
    const mensajes = this.mensajeRepository.find({
      relations: ['idExpediente', 'idUsuarioMunicipal'],
      order: { fechaEnvio: 'DESC' }
    });
    return this.handleException(mensajes, NotFoundException, 'No se encontraron mensajes');
  }

  // [S-38] Devuelve un mensaje con sus relaciones.
  async findOne(idMensaje: number): Promise<Mensaje> {
    const mensaje = await this.mensajeRepository.findOne({
      where: { idMensaje },
      relations: ['idExpediente', 'idUsuarioMunicipal']
    });
    return this.handleException(mensaje, NotFoundException, `Mensaje con ID ${idMensaje} no encontrado`);
  }

  // Devuelve mensajes de un expediente en orden cronológico para vista de conversación.
  async findByExpediente(idExpediente: number): Promise<Mensaje[]> {
    const mensajes = await this.mensajeRepository.find({
      where: { idExpediente },
      relations: ['idUsuarioMunicipal'],
      order: { fechaEnvio: 'ASC' }
    });
    return this.handleException(mensajes, NotFoundException, `No se encontraron mensajes para el expediente ${idExpediente}`);
  }

  // Devuelve mensajes no leídos. Opcionalmente filtra por expediente para el contador de notificaciones.
  async findNoLeidos(idExpediente?: number): Promise<Mensaje[]> {
    const whereCondition: any = { leido: false };
    if (idExpediente) whereCondition.idExpediente = idExpediente;
    return this.mensajeRepository.find({
      where: whereCondition,
      relations: ['idExpediente', 'idUsuarioMunicipal'],
      order: { fechaEnvio: 'DESC' }
    });
  }

  // Marca un mensaje individual como leído.
  async marcarComoLeido(idMensaje: number): Promise<Mensaje> {
    let mensaje = await this.mensajeRepository.findOneBy({ idMensaje });
    mensaje = this.handleException(mensaje, NotFoundException, `Mensaje con ID ${idMensaje} no encontrado`);
    mensaje.leido = true;
    return this.mensajeRepository.save(mensaje);
  }

  // Marca todos los mensajes no leídos de un expediente de una sola query.
  async marcarTodosComoLeidos(idExpediente: number): Promise<void> {
    await this.mensajeRepository.update(
      { idExpediente, leido: false },
      { leido: true }
    );
  }

  // [S-39] Actualiza un mensaje.
  async update(id: number, updateMensajeDto: UpdateMensajeDto): Promise<Mensaje> {
    let existingMensaje = await this.mensajeRepository.findOneBy({ idMensaje: id });
    existingMensaje = this.handleException(existingMensaje, NotFoundException, `Mensaje con ID ${id} no encontrado`);
    Object.assign(existingMensaje, updateMensajeDto);
    return this.mensajeRepository.save(existingMensaje);
  }

  // [S-40] Elimina un mensaje.
  async remove(id: number) {
    let existingMensaje = await this.mensajeRepository.findOneBy({ idMensaje: id });
    existingMensaje = this.handleException(existingMensaje, NotFoundException, `Mensaje con ID ${id} no encontrado`);
    return this.mensajeRepository.remove(existingMensaje);
  }
}
