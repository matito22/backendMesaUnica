import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { ContribuyenteService } from './contribuyente.service';
import { CreateContribuyenteDto } from './dto/create-contribuyente.dto';
import { UpdateContribuyenteDto } from './dto/update-contribuyente.dto';

@Controller('contribuyente')
export class ContribuyenteController {
  constructor(private readonly contribuyenteService: ContribuyenteService) {}

  @Post()
  create(@Body() createContribuyenteDto: CreateContribuyenteDto) {
    return this.contribuyenteService.create(createContribuyenteDto);
  }

  @Get()
  findAll() {
    return this.contribuyenteService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.contribuyenteService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateContribuyenteDto: UpdateContribuyenteDto) {
    return this.contribuyenteService.update(+id, updateContribuyenteDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.contribuyenteService.remove(+id);
  }
}
