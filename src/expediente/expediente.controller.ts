import { Controller, Get, Post, Body, Patch, Param, Delete, ParseIntPipe, HttpCode, HttpStatus } from '@nestjs/common';
import { ExpedienteService } from './expediente.service';
import { CreateExpedienteDto } from './dto/create-expediente.dto';
import { UpdateExpedienteDto } from './dto/update-expediente.dto';

// IMPORTANTE: Las rutas con path fijo (/gde, /contribuyente, /hijos)
// deben ir ANTES de la ruta dinámica (:id) para que NestJS no las
// confunda e intente parsear "gde" como un id numérico.

@Controller('expediente')
export class ExpedienteController {
  constructor(private readonly expedienteService: ExpedienteService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  create(@Body() createExpedienteDto: CreateExpedienteDto) {
    return this.expedienteService.create(createExpedienteDto);
  }

  @Get()
  findAll() {
    return this.expedienteService.findAll();
  }

  // Rutas específicas ANTES de /:id para evitar colisiones
  @Get('gde/:numeroGde')
  findByNumeroGde(@Param('numeroGde') numeroGde: string) {
    return this.expedienteService.findByNumeroGde(numeroGde);
  }

  @Get('contribuyente/:idContribuyente')
  findByContribuyente(@Param('idContribuyente', ParseIntPipe) idContribuyente: number) {
    return this.expedienteService.findByContribuyente(idContribuyente);
  }

  @Get('hijos/:idExpedientePadre')
  findHijos(@Param('idExpedientePadre', ParseIntPipe) idExpedientePadre: number) {
    return this.expedienteService.findHijos(idExpedientePadre);
  }

  // Ruta dinámica por id — siempre al final
  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.expedienteService.findOne(id);
  }

  @Patch(':id')
  update(@Param('id', ParseIntPipe) id: number, @Body() updateExpedienteDto: UpdateExpedienteDto) {
    return this.expedienteService.update(id, updateExpedienteDto);
  }

  @Delete(':id')
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.expedienteService.remove(id);
  }
}