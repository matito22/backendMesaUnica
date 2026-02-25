import { Controller, Get, Post, Body, Patch, Param, Delete, ParseIntPipe } from '@nestjs/common';
import { TipoDocumentoService } from './tipo-documento.service';
import { CreateTipoDocumentoDto } from './dto/create-tipo-documento.dto';
import { UpdateTipoDocumentoDto } from './dto/update-tipo-documento.dto';

@Controller('tipo-documento')
export class TipoDocumentoController {
  constructor(private readonly tipoDocumentoService: TipoDocumentoService) {}

  @Post()
  create(@Body() createTipoDocumentoDto: CreateTipoDocumentoDto) {
    return this.tipoDocumentoService.create(createTipoDocumentoDto);
  }

  @Get()
  findAll() {
    return this.tipoDocumentoService.findAll();
  }

  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.tipoDocumentoService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id', ParseIntPipe) id: number, @Body() updateTipoDocumentoDto: UpdateTipoDocumentoDto) {
    return this.tipoDocumentoService.update(+id, updateTipoDocumentoDto);
  }

  @Delete(':id')
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.tipoDocumentoService.remove(+id);
  }
}
