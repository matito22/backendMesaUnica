import { Body, Controller, Delete, Get, Param, Post, Put, ParseIntPipe } from '@nestjs/common';
import { DatosCatastralesService } from './datos-catastrales.service';
import { CreateDatosCatastralesDto } from './dto/create-datos-catastrales.dto';
import { UpdateDatosCatastralesDto } from './dto/update-datos-catastrales.dto';

@Controller('datos-catastrales')
export class DatosCatastralesController {
  constructor(private readonly svc: DatosCatastralesService) {}

  @Post()
  create(@Body() dto: CreateDatosCatastralesDto) {
    return this.svc.create(dto);
  }

  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.svc.findOne(id);
  }

  @Put(':id')
  update(@Param('id', ParseIntPipe) id: number, @Body() dto: UpdateDatosCatastralesDto) {
    return this.svc.update(id, dto);
  }

  @Delete(':id')
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.svc.remove(id);
  }
}
