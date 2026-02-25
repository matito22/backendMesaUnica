import { Controller, Get, Post, Body, Patch, Param, Delete, ParseIntPipe } from '@nestjs/common';
import { HistorialDocumentoService } from './historial-documento.service';
import { CreateHistorialDocumentoDto } from './dto/create-historial-documento.dto';
import { UpdateHistorialDocumentoDto } from './dto/update-historial-documento.dto';

@Controller('historial-documento')
export class HistorialDocumentoController {
  constructor(private readonly historialDocumentoService: HistorialDocumentoService) {}

  @Post()
  create(@Body() createHistorialDocumentoDto: CreateHistorialDocumentoDto) {
    return this.historialDocumentoService.create(createHistorialDocumentoDto);
  }

  @Get()
  findAll() {
    return this.historialDocumentoService.findAll();
  }

  // Ruta específica ANTES de /:id
  @Get('documento/:idDocumento')
  findByDocumento(@Param('idDocumento', ParseIntPipe) idDocumento: number) {
    return this.historialDocumentoService.findByDocumento(idDocumento);
  }

  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.historialDocumentoService.findOne(id);
  }

  @Patch(':id')
  update(@Param('id', ParseIntPipe) id: number, @Body() updateHistorialDocumentoDto: UpdateHistorialDocumentoDto) {
    return this.historialDocumentoService.update(id, updateHistorialDocumentoDto);
  }

  @Delete(':id')
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.historialDocumentoService.remove(id);
  }
}