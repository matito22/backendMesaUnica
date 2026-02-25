import { Controller, Get, Post, Body, Patch, Param, Delete, ParseIntPipe } from '@nestjs/common';
import { SectorMunicipalService } from './sector-municipal.service';
import { CreateSectorMunicipalDto } from './dto/create-sector-municipal.dto';
import { UpdateSectorMunicipalDto } from './dto/update-sector-municipal.dto';
import { Public } from 'src/auth/public-key';

@Controller('sector-municipal')
export class SectorMunicipalController {
  constructor(private readonly sectorMunicipalService: SectorMunicipalService) {}


  @Post()
  create(@Body() createSectorMunicipalDto: CreateSectorMunicipalDto) {
    return this.sectorMunicipalService.create(createSectorMunicipalDto);
  }

  @Get()
  findAll() {
    return this.sectorMunicipalService.findAll();
  }

  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.sectorMunicipalService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id', ParseIntPipe) id: number, @Body() updateSectorMunicipalDto: UpdateSectorMunicipalDto) {
    return this.sectorMunicipalService.update(+id, updateSectorMunicipalDto);
  }

  @Delete(':id')
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.sectorMunicipalService.remove(+id);
  }
}
