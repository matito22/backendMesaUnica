import { Controller, Get, Post, Body, Patch, Param, Delete, ParseIntPipe, Query } from '@nestjs/common';
import { ContribuyenteService } from './contribuyente.service';
import { CreateContribuyenteDto } from './dto/create-contribuyente.dto';
import { UpdateContribuyenteDto } from './dto/update-contribuyente.dto';
import { Contribuyente } from './entities/contribuyente.entity';

@Controller('contribuyente')
export class ContribuyenteController {
  constructor(private readonly contribuyenteService: ContribuyenteService) {}



  @Get('search')
  search(@Query('search') search: string): Promise<Contribuyente[]> {
    return this.contribuyenteService.buscarContribuyentes(search);
  }

  @Get()
  findAll() {
    return this.contribuyenteService.findAll();
  }

  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.contribuyenteService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id', ParseIntPipe) id: number, @Body() updateContribuyenteDto: UpdateContribuyenteDto) {
    return this.contribuyenteService.update(+id, updateContribuyenteDto);
  }

  @Delete(':id')
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.contribuyenteService.remove(+id);
  }


}
