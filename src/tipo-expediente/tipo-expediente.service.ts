import {
  Injectable,
  NotFoundException,
  ConflictException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateTipoExpedienteDto } from './dto/create-tipo-expediente.dto';
import { UpdateTipoExpedienteDto } from './dto/update-tipo-expediente.dto';
import { HandleService } from '../utils/handle.service';
import { SectorMunicipal } from '../sector-municipal/entities/sector-municipal.entity';
import { TipoExpediente } from './entities/tipo-expediente.entity';

@Injectable()
export class TipoExpedienteService extends HandleService {
  constructor(
    @InjectRepository(TipoExpediente)
    private readonly tipoExpedienteRepository: Repository<TipoExpediente>,

    @InjectRepository(SectorMunicipal)
    private readonly sectorRepository: Repository<SectorMunicipal>,
  ) {
    super();
  }

  // ────────────────────────────────
  // CREAR
  // ────────────────────────────────
  async create(dto: CreateTipoExpedienteDto): Promise<TipoExpediente> {
    const existe = await this.tipoExpedienteRepository.findOne({
      where: { nombre: dto.nombre },
    });

    if (existe) {
      throw new ConflictException(
        `Ya existe un tipo de expediente con el nombre "${dto.nombre}"`,
      );
    }

    // Validar sector
    const sector = await this.sectorRepository.findOne({
      where: { idSector: dto.idSectorResponsable },
    });

    if (!sector) {
      throw new NotFoundException('El sector responsable no existe');
    }

    const nuevo = this.tipoExpedienteRepository.create({
      sectorResponsable: sector,
      nombre: dto.nombre,
      descripcion: dto.descripcion ?? null,
      schemaFormulario: dto.schemaFormulario ?? null,
    });

    const guardado = await this.tipoExpedienteRepository.save(nuevo);

    return this.findOne(guardado.idTipoExpediente);
  }

  // ────────────────────────────────
  // OBTENER UNO
  // ────────────────────────────────
  async findOne(idTipoExpediente: number): Promise<TipoExpediente> {
    const tipo = await this.tipoExpedienteRepository.findOne({
      where: { idTipoExpediente },
      relations: ['sectorResponsable'],
    });

    return this.handleException(
      tipo,
      NotFoundException,
      `Tipo de expediente with ID ${idTipoExpediente} not found`,
    );
  }

  // ────────────────────────────────
  // LISTAR
  // ────────────────────────────────
  async findAll(soloActivos = true): Promise<TipoExpediente[]> {
    return this.tipoExpedienteRepository.find({
      where: soloActivos ? { activo: true } : {},
      relations: ['sectorResponsable'],
      order: { nombre: 'ASC' },
    });
  }

  // ────────────────────────────────
  // ACTUALIZAR
  // ────────────────────────────────
  async update(
    id: number,
    dto: UpdateTipoExpedienteDto,
  ): Promise<TipoExpediente> {
    const tipo = await this.tipoExpedienteRepository.findOne({
      where: { idTipoExpediente: id },
      relations: ['sectorResponsable'],
    });

    if (!tipo) {
      throw new NotFoundException(
        `Tipo de expediente con id ${id} no encontrado`,
      );
    }

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

        if (dto.idSectorResponsable !== undefined) {
        const sector = await this.sectorRepository.findOne({
          where: { idSector: dto.idSectorResponsable },
        });

        if (!sector) {
          throw new NotFoundException('El sector responsable no existe');
        }

        tipo.sectorResponsable = sector;
      }

    if (dto.nombre !== undefined) tipo.nombre = dto.nombre;
    if (dto.descripcion !== undefined) tipo.descripcion = dto.descripcion;
    if (dto.schemaFormulario !== undefined)
      tipo.schemaFormulario = dto.schemaFormulario;
    if (dto.activo !== undefined) tipo.activo = dto.activo;

    await this.tipoExpedienteRepository.save(tipo);

    return this.findOne(id);
  }

  // ────────────────────────────────
  // BAJA LÓGICA
  // ────────────────────────────────
  async deactivate(id: number): Promise<{ mensaje: string }> {
    const tipo = await this.tipoExpedienteRepository.findOne({
      where: { idTipoExpediente: id },
    });

    if (!tipo) {
      throw new NotFoundException(
        `Tipo de expediente con id ${id} no encontrado`,
      );
    }

    if (!tipo.activo) {
      throw new ConflictException(
        `El tipo de expediente con id ${id} ya está inactivo`,
      );
    }

    tipo.activo = false;
    await this.tipoExpedienteRepository.save(tipo);

    return {
      mensaje: `Tipo de expediente "${tipo.nombre}" desactivado correctamente`,
    };
  }

  // ────────────────────────────────
  // MÉTODO INTERNO
  // ────────────────────────────────
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
