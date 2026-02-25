import { Controller, Get, Post, Body, Patch, Param, Delete, ParseIntPipe } from '@nestjs/common';
import { UsuarioMunicipalService } from './usuario-municipal.service';
import { CreateUsuarioMunicipalDto } from './dto/create-usuario-municipal.dto';
import { UpdateUsuarioMunicipalDto } from './dto/update-usuario-municipal.dto';

@Controller('usuario-municipal')
export class UsuarioMunicipalController {
  constructor(private readonly usuarioMunicipalService: UsuarioMunicipalService) {}

  

  @Get()
  findAll() {
    return this.usuarioMunicipalService.findAll();
  }

  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.usuarioMunicipalService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id', ParseIntPipe) id: number, @Body() updateUsuarioMunicipalDto: UpdateUsuarioMunicipalDto) {
    return this.usuarioMunicipalService.update(+id, updateUsuarioMunicipalDto);
  }

  @Delete(':id')
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.usuarioMunicipalService.remove(+id);
  }
}
