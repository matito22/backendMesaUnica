import {
  Controller, Get, Post, Patch, Delete,
  Param, Body, ParseIntPipe, Query, HttpCode, HttpStatus,
} from '@nestjs/common';
import { TipoExpedienteService } from './tipo-expediente.service';
import { UpdateTipoExpedienteDto } from './dto/update-tipo-expediente.dto';
import { CreateTipoExpedienteDto } from './dto/create-tipo-expediente.dto';

@Controller('tipos-expediente')
export class TipoExpedienteController {
  constructor(private readonly tipoExpedienteService: TipoExpedienteService) {}

  // [C-47] Devuelve tipos de expediente activos. Con ?todos=true incluye los inactivos.
  // Llama a → [S-48] TipoExpedienteService.findAll
  @Get()
  async findAll(@Query('todos') todos?: string) {
    const soloActivos = todos !== 'true';
    return this.tipoExpedienteService.findAll(soloActivos);
  }

  // [C-48] Devuelve un tipo de expediente con sector y requisitos.
  // Llama a → [S-49] TipoExpedienteService.findOne
  @Get(':id')
  async findOne(@Param('id', ParseIntPipe) id: number) {
    return this.tipoExpedienteService.findOne(id);
  }

  // [C-49] Crea un nuevo tipo de expediente.
  // Llama a → [S-50] TipoExpedienteService.create
  @Post()
  @HttpCode(HttpStatus.CREATED)
  async create(@Body() dto: CreateTipoExpedienteDto) {
    return this.tipoExpedienteService.create(dto);
  }

  // [C-50] Actualiza nombre, descripción, sector o schema del formulario.
  // Llama a → [S-51] TipoExpedienteService.update
  @Patch(':id')
  async update(@Param('id', ParseIntPipe) id: number, @Body() dto: UpdateTipoExpedienteDto) {
    return this.tipoExpedienteService.update(id, dto);
  }

  // [C-51] Baja LÓGICA: marca activo:false sin eliminar de la DB.
  // Así los expedientes ya creados con ese tipo conservan la referencia.
  // Llama a → [S-52] TipoExpedienteService.deactivate
  @Delete(':id')
  @HttpCode(HttpStatus.OK)
  async deactivate(@Param('id', ParseIntPipe) id: number): Promise<{ mensaje: string }> {
    return this.tipoExpedienteService.deactivate(id);
  }
}
