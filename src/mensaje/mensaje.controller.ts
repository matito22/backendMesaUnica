import { Controller, Get, Post, Body, Patch, Param, Delete, ParseIntPipe } from '@nestjs/common';
import { MensajeService } from './mensaje.service';
import { CreateMensajeDto } from './dto/create-mensaje.dto';
import { UpdateMensajeDto } from './dto/update-mensaje.dto';

@Controller('mensaje')
export class MensajeController {
  constructor(private readonly mensajeService: MensajeService) {}

  @Post()
  create(@Body() createMensajeDto: CreateMensajeDto) {
    return this.mensajeService.create(createMensajeDto);
  }

  @Get()
  findAll() {
    return this.mensajeService.findAll();
  }

  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.mensajeService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id', ParseIntPipe) id: number, @Body() updateMensajeDto: UpdateMensajeDto) {
    return this.mensajeService.update(+id, updateMensajeDto);
  }

  @Delete(':id')
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.mensajeService.remove(+id);
  }
}
