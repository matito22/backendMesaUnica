import { Controller, Get, Post, Body, Patch, Param, Delete, ParseIntPipe } from '@nestjs/common';
import { UsuarioMunicipalService } from './usuario-municipal.service';
import { CreateUsuarioMunicipalDto } from './dto/create-usuario-municipal.dto';
import { UpdateUsuarioMunicipalDto } from './dto/update-usuario-municipal.dto';

// El REGISTRO de usuarios municipales se hace desde AuthController [C-01], no desde acá.

@Controller('usuario-municipal')
export class UsuarioMunicipalController {
  constructor(private readonly usuarioMunicipalService: UsuarioMunicipalService) {}

  // [C-31] Devuelve todos los usuarios municipales.
  // Llama a → [S-32] UsuarioMunicipalService.findAll
  @Get()
  findAll() {
    return this.usuarioMunicipalService.findAll();
  }

  // [C-32] Devuelve un usuario municipal por id.
  // Llama a → [S-33] UsuarioMunicipalService.findOne
  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.usuarioMunicipalService.findOne(+id);
  }

  // [C-33] Actualiza datos de un usuario municipal.
  // Llama a → [S-34] UsuarioMunicipalService.update
  @Patch(':id')
  update(@Param('id', ParseIntPipe) id: number, @Body() updateUsuarioMunicipalDto: UpdateUsuarioMunicipalDto) {
    return this.usuarioMunicipalService.update(+id, updateUsuarioMunicipalDto);
  }

  // [C-34] Elimina un usuario municipal.
  // Llama a → [S-35] UsuarioMunicipalService.remove
  @Delete(':id')
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.usuarioMunicipalService.remove(+id);
  }
}
