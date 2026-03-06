import { Controller, Get, Post, Body, Patch, Param, Delete, ParseIntPipe } from '@nestjs/common';
import { MensajeService } from './mensaje.service';
import { CreateMensajeDto } from './dto/create-mensaje.dto';
import { UpdateMensajeDto } from './dto/update-mensaje.dto';

@Controller('mensaje')
export class MensajeController {
  constructor(private readonly mensajeService: MensajeService) {}

  // [C-35] Crea un mensaje asociado a un expediente.
  // Llama a → [S-36] MensajeService.create
  @Post()
  create(@Body() createMensajeDto: CreateMensajeDto) {
    return this.mensajeService.create(createMensajeDto);
  }

  // [C-36] Devuelve todos los mensajes.
  // Llama a → [S-37] MensajeService.findAll
  @Get()
  findAll() {
    return this.mensajeService.findAll();
  }

  // [C-37] Devuelve un mensaje específico.
  // Llama a → [S-38] MensajeService.findOne
  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.mensajeService.findOne(+id);
  }

  // [C-38] Actualiza un mensaje (ej: marcar como leído).
  // Llama a → [S-39] MensajeService.update
  @Patch(':id')
  update(@Param('id', ParseIntPipe) id: number, @Body() updateMensajeDto: UpdateMensajeDto) {
    return this.mensajeService.update(+id, updateMensajeDto);
  }

  // [C-39] Elimina un mensaje.
  // Llama a → [S-40] MensajeService.remove
  @Delete(':id')
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.mensajeService.remove(+id);
  }
}
