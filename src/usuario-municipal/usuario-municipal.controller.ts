import { Controller, Get, Post, Body, Patch, Param, Delete, ParseIntPipe, Query } from '@nestjs/common';
import { UsuarioMunicipalService } from './usuario-municipal.service';
import { CreateUsuarioMunicipalDto } from './dto/create-usuario-municipal.dto';
import { UpdateUsuarioMunicipalDto } from './dto/update-usuario-municipal.dto';
import { UsuarioMunicipal } from './entities/usuario-municipal.entity';

// El REGISTRO de usuarios municipales se hace desde AuthController [C-01], no desde acá.

@Controller('usuario-municipal')
export class UsuarioMunicipalController {
  constructor(private readonly usuarioMunicipalService: UsuarioMunicipalService) {}

  @Get('email/:email')
  getUsuarioByEmail(@Param('email') email: string): Promise<UsuarioMunicipal | null> {
    return this.usuarioMunicipalService.findByEmail(email);
    }

    
  @Get('nombre/:nombre')
  getUsuarioByName(@Param('nombre') nombre: string): Promise<UsuarioMunicipal | null> {
    return this.usuarioMunicipalService.findByName(nombre);
  }

  // [C-31] Devuelve todos los usuarios municipales.
  // Llama a → [S-32] UsuarioMunicipalService.findAll
  @Get()
  findAll(@Query('page') page=1,@Query('limit') limit=10) {
    return this.usuarioMunicipalService.findAll({page,limit});
  }

  @Get('slug/:slug')
  getUsuarioBySlug(@Param('slug') slug: string): Promise<UsuarioMunicipal | null> {
    return this.usuarioMunicipalService.findBySlug(slug);
  }

 

  // [C-32] Devuelve un usuario municipal por id.
  // Llama a → [S-33] UsuarioMunicipalService.findOne
  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.usuarioMunicipalService.findOne(+id);
  }

  // [C-33] Actualiza datos de un usuario municipal.
  // Llama a → [S-34] UsuarioMunicipalService.update
  @Patch('slug/:slug')
  updateBySlug(@Param('slug') slug: string, @Body() updateUsuarioMunicipalDto: UpdateUsuarioMunicipalDto) {

    return this.usuarioMunicipalService.updateBySlug(slug, updateUsuarioMunicipalDto);
  }

  // [C-34] Elimina un usuario municipal.
  // Llama a → [S-35] UsuarioMunicipalService.remove
  @Delete(':id')
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.usuarioMunicipalService.remove(+id);
  }
}
