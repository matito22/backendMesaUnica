import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
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
  findOne(@Param('id') id: string) {
    return this.sectorMunicipalService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateSectorMunicipalDto: UpdateSectorMunicipalDto) {
    return this.sectorMunicipalService.update(+id, updateSectorMunicipalDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.sectorMunicipalService.remove(+id);
  }
}
