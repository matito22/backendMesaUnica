import { Controller, Get, Post, Body, Patch, Param, Delete, ParseIntPipe, HttpCode, HttpStatus, UseGuards, Request } from '@nestjs/common';
import { ExpedienteService } from './expediente.service';
import { CreateExpedienteDto } from './dto/create-expediente.dto';
import { UpdateExpedienteDto } from './dto/update-expediente.dto';
import { Roles } from '../auth/roles.decorator';
import { RolUser } from '../enum/rol-user';
import { RolesGuard } from '../auth/roles.guard';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';


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


  @Get('revisor')
  @Roles(RolUser.REVISOR)
  @UseGuards(JwtAuthGuard, RolesGuard)
  getByRevisor(@Request() req) {
  const idSector: number = req.user.idSector;
  console.log('ID del sector:', idSector);
  console.log('Rol del usuario:', req.user.role); // ← role, no rol
  return this.expedienteService.findBySectorResponsable(idSector);
}

 /* @Get('hijos/:idExpedientePadre')
  findHijos(@Param('idExpedientePadre', ParseIntPipe) idExpedientePadre: number) {
    return this.expedienteService.findHijos(idExpedientePadre);

  }*/


@Patch(':id/formulario')
updateFormulario(
  @Param('id', ParseIntPipe) id: number,
  @Body() datosFormulario: Record<string, any>,
) {
  return this.expedienteService.updateFormulario(id, datosFormulario);
}
  
  @Patch(':id')
  update(@Param('id', ParseIntPipe) id: number, @Body() updateExpedienteDto: UpdateExpedienteDto) {
    return this.expedienteService.update(id, updateExpedienteDto);
  }

  

  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.expedienteService.findOne(id);
  }



  @Delete(':id')
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.expedienteService.remove(id);
  }
}