import {
  Injectable,
  NotFoundException,
  ConflictException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { TipoExpediente } from './entities/tipo-expediente.entity';
import { CreateTipoExpedienteDto } from './dto/create-tipo-expediente.dto';
import { UpdateTipoExpedienteDto } from './dto/update-tipo-expediente.dto';
import { HandleService } from 'src/utils/handle.service';



@Injectable()
export class TipoExpedienteService extends HandleService {
  constructor(
    @InjectRepository(TipoExpediente)
    private readonly tipoExpedienteRepository: Repository<TipoExpediente>,
  ) {
    super();
  }

  // ─────────────────────────────────────────────
  // CREAR
  // ─────────────────────────────────────────────
  async create(dto: CreateTipoExpedienteDto): Promise<TipoExpediente> {
    // Verificar nombre duplicado (nombres de trámite deben ser únicos)
    const existe = await this.tipoExpedienteRepository.findOne({
      where: { nombre: dto.nombre },
    });
    if (existe) {
      throw new ConflictException(
        `Ya existe un tipo de expediente con el nombre "${dto.nombre}"`,
      );
    }

    const nuevo = this.tipoExpedienteRepository.create({
      idSectorResponsable: dto.idSectorResponsable,
      nombre:              dto.nombre,
      descripcion:         dto.descripcion ?? null,
      schemaFormulario:    dto.schemaFormulario ?? null,
    });

    const guardado = await this.tipoExpedienteRepository.save(nuevo);
    return this.findOne(guardado.idTipoExpediente);
  }


    async findOne(idTipoExpediente: number):Promise<TipoExpediente> {
      const sector = await this.tipoExpedienteRepository.findOneBy({ idTipoExpediente });
        return this.handleException(
          sector,
          NotFoundException,
          `Tipo de expediente with ID ${idTipoExpediente} not found`
        );
    }

  // ─────────────────────────────────────────────
  // ACTUALIZAR
  // ─────────────────────────────────────────────
  async update(id: number,dto: UpdateTipoExpedienteDto): Promise<TipoExpediente> {
    // Verificar que el registro existe antes de intentar actualizar
    const tipo = await this.tipoExpedienteRepository.findOne({
      where: { idTipoExpediente: id },
    });

    if (!tipo) {
      throw new NotFoundException(`Tipo de expediente con id ${id} no encontrado`);
    }

    // Si está cambiando el nombre, verificar que no colisione con otro registro
    if (dto.nombre && dto.nombre !== tipo.nombre) {
      const colision = await this.tipoExpedienteRepository.findOne({
        where: { nombre: dto.nombre },
      });
      if (colision) {
        throw new ConflictException(
          `Ya existe un tipo de expediente con el nombre "${dto.nombre}"`,
        );
      }
    }

    await this.tipoExpedienteRepository.update(id, {
      ...(dto.idSectorResponsable !== undefined && { idSectorResponsable: dto.idSectorResponsable }),
      ...(dto.nombre              !== undefined && { nombre: dto.nombre }),
      ...(dto.descripcion         !== undefined && { descripcion: dto.descripcion }),
      ...(dto.schemaFormulario    !== undefined && { schemaFormulario: dto.schemaFormulario }),
      ...(dto.activo              !== undefined && { activo: dto.activo }),
    });

    return this.findOne(id);
  }

  // ─────────────────────────────────────────────
  // BAJA LÓGICA (no se borra el registro de la BD)
  // ─────────────────────────────────────────────
  async deactivate(id: number): Promise<{ mensaje: string }> {
    const tipo = await this.tipoExpedienteRepository.findOne({
      where: { idTipoExpediente: id },
    });

    if (!tipo) {
      throw new NotFoundException(`Tipo de expediente con id ${id} no encontrado`);
    }

    if (!tipo.activo) {
      throw new ConflictException(`El tipo de expediente con id ${id} ya está inactivo`);
    }

    await this.tipoExpedienteRepository.update(id, { activo: false });

    return { mensaje: `Tipo de expediente "${tipo.nombre}" desactivado correctamente` };
  }

  // ─────────────────────────────────────────────
  // MÉTODO INTERNO: obtener entidad cruda (útil para otros servicios)
  // Por ejemplo, ExpedienteService lo puede usar para validar el tipo al crear un expediente
  // ─────────────────────────────────────────────
  async findEntityById(id: number): Promise<TipoExpediente> {
    const tipo = await this.tipoExpedienteRepository.findOne({
      where: { idTipoExpediente: id, activo: true },
    });

    if (!tipo) {
      throw new NotFoundException(
        `Tipo de expediente con id ${id} no encontrado o inactivo`,
      );
    }

    return tipo;
  }
}