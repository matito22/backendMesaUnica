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

  // GET /tipos-expediente
  // GET /tipos-expediente?todos=true  → incluye inactivos
  @Get()
  async findAll(@Query('todos') todos?: string) {
    const soloActivos = todos !== 'true';
    return this.tipoExpedienteService.findAll(soloActivos);
  }

  @Get(':id')
  async findOne(@Param('id', ParseIntPipe) id: number) {
    return this.tipoExpedienteService.findOne(id);
  }

  @Post()
  @HttpCode(HttpStatus.CREATED)
  async create(@Body() dto: CreateTipoExpedienteDto) {
    return this.tipoExpedienteService.create(dto);
  }

  @Patch(':id')
  async update(@Param('id', ParseIntPipe) id: number, @Body() dto: UpdateTipoExpedienteDto) {
    return this.tipoExpedienteService.update(id, dto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.OK)
  async deactivate(@Param('id', ParseIntPipe) id: number): Promise<{ mensaje: string }> {
    return this.tipoExpedienteService.deactivate(id);
  }
}