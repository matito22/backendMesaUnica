import { Controller, Get, Post, Body, Patch, Param, Delete, ParseIntPipe, Query } from '@nestjs/common';
import { ContribuyenteService } from './contribuyente.service';
import { CreateContribuyenteDto } from './dto/create-contribuyente.dto';
import { UpdateContribuyenteDto } from './dto/update-contribuyente.dto';
import { Contribuyente } from './entities/contribuyente.entity';

// El REGISTRO de contribuyentes se hace desde AuthController [C-02], no desde acá.
// /search y /dni/:dni van ANTES de /:id para evitar colisiones de rutas.

@Controller('contribuyente')
export class ContribuyenteController {
  constructor(private readonly contribuyenteService: ContribuyenteService) {}

  // [C-26] Búsqueda parcial por DNI para el autocomplete del frontend.
  // Llama a → [S-27] ContribuyenteService.buscarContribuyentes
  @Get('search')
  search(@Query('search') search: string): Promise<Contribuyente[]> {
    return this.contribuyenteService.buscarContribuyentes(search);
  }

  // [C-27] Busca un contribuyente por DNI exacto. Retorna null si no existe.
  // Llama a → [S-28] ContribuyenteService.findByDni
  @Get('dni/:dni')
  getContribuyenteByDni(@Param('dni') dni: string): Promise<Contribuyente | null> {
    return this.contribuyenteService.findByDni(dni);
  }

  // [C-28] Devuelve todos los contribuyentes.
  // Llama a → [S-29] ContribuyenteService.findAll
  @Get()
  findAll() {
    return this.contribuyenteService.findAll();
  }

  // [C-29] Actualiza datos de un contribuyente. Aún no se usa en el sistema.
  // Llama a → [S-30] ContribuyenteService.update
  @Patch(':id')
  update(@Param('id', ParseIntPipe) id: number, @Body() updateContribuyenteDto: UpdateContribuyenteDto) {
    return this.contribuyenteService.update(+id, updateContribuyenteDto);
  }

  // [C-30] Elimina un contribuyente. Aún no se usa en el sistema.
  // Llama a → [S-31] ContribuyenteService.remove
  @Delete(':id')
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.contribuyenteService.remove(+id);
  }
}
