import { Controller, Get, Post, Body, Patch, Param, Delete, ParseIntPipe } from '@nestjs/common';
import { SectorMunicipalService } from './sector-municipal.service';
import { CreateSectorMunicipalDto } from './dto/create-sector-municipal.dto';
import { UpdateSectorMunicipalDto } from './dto/update-sector-municipal.dto';
import { Public } from 'src/auth/public-key';

@Controller('sector-municipal')
export class SectorMunicipalController {
  constructor(private readonly sectorMunicipalService: SectorMunicipalService) {}

  // [C-42] Crea un nuevo sector municipal.
  // Llama a → [S-43] SectorMunicipalService.create
  @Post()
  create(@Body() createSectorMunicipalDto: CreateSectorMunicipalDto) {
    return this.sectorMunicipalService.create(createSectorMunicipalDto);
  }

  // [C-43] Devuelve todos los sectores. Lo usa el frontend para poblar el selector al crear usuarios.
  // Llama a → [S-44] SectorMunicipalService.findAll
  @Get()
  findAll() {
    return this.sectorMunicipalService.findAll();
  }

  // [C-44] Devuelve un sector específico.
  // Llama a → [S-45] SectorMunicipalService.findOne
  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.sectorMunicipalService.findOne(+id);
  }

  // [C-45] Actualiza un sector.
  // Llama a → [S-46] SectorMunicipalService.update
  @Patch(':id')
  update(@Param('id', ParseIntPipe) id: number, @Body() updateSectorMunicipalDto: UpdateSectorMunicipalDto) {
    return this.sectorMunicipalService.update(+id, updateSectorMunicipalDto);
  }

  // [C-46] Elimina un sector.
  // Llama a → [S-47] SectorMunicipalService.remove
  @Delete(':id')
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.sectorMunicipalService.remove(+id);
  }
}
