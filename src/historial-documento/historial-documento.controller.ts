import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
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

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.historialDocumentoService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateHistorialDocumentoDto: UpdateHistorialDocumentoDto) {
    return this.historialDocumentoService.update(+id, updateHistorialDocumentoDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.historialDocumentoService.remove(+id);
  }
}
