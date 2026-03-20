import {
  Controller, Get, Post, Body, Patch, Param, Delete,
  ParseIntPipe, HttpCode, HttpStatus, UseGuards, Request,
  Query
} from '@nestjs/common';
import { ExpedienteService } from './expediente.service';
import { CreateExpedienteDto } from './dto/create-expediente.dto';
import { UpdateExpedienteDto } from './dto/update-expediente.dto';
import { Roles } from '../auth/roles.decorator';
import { RolUser } from '../enum/rol-user';
import { RolesGuard } from '../auth/roles.guard';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { CambiarEstadoDto } from './dto/cambiar-estado.dto';

// Las rutas con path fijo (/gde, /contribuyente, /revisor) van ANTES de /:id
// para que NestJS no intente parsear "gde" o "revisor" como un número.

@Controller('expediente')
export class ExpedienteController {
  constructor(private readonly expedienteService: ExpedienteService) {}

  // [C-11] Crea un expediente. Internamente también genera los documentos en PENDIENTE_CARGA.
  // Llama a → [S-12] ExpedienteService.create
  @Post()
  @HttpCode(HttpStatus.CREATED)
  create(@Body() createExpedienteDto: CreateExpedienteDto) {
    return this.expedienteService.create(createExpedienteDto);
  }

  @Post('cambiar-estado')
  cambiarEstado(@Body() cambiarEstadoDto: CambiarEstadoDto) {
    return this.expedienteService.cambiarEstado(cambiarEstadoDto);
  }

  // [C-12] Devuelve expedientes activos (INICIADO o EN_REVISION).
  // Llama a → [S-13] ExpedienteService.findAll
  @Get()
  findAll(@Query('page') page=1,@Query('limit') limit=10) {
    return this.expedienteService.findAll({page,limit});
  }

  // [C-13] Busca un expediente por su número GDE.
  // Llama a → [S-14] ExpedienteService.findByNumeroGde
  @Get('gde/:numeroGde')
  findByNumeroGde(@Param('numeroGde') numeroGde: string) {
    return this.expedienteService.findByNumeroGde(numeroGde);
  }

  // [C-14] Devuelve todos los expedientes de un contribuyente.
  // Llama a → [S-15] ExpedienteService.findByContribuyente
  @Get('contribuyente/:idContribuyente')
  findByContribuyente(@Param('idContribuyente', ParseIntPipe) idContribuyente: number,@Query('page') page=1,@Query('limit') limit=10) {
    return this.expedienteService.findByContribuyente(idContribuyente,{page,limit});
  }

  // [C-15] Devuelve los expedientes que le corresponden al sector del revisor logueado.
  // El idSector se extrae del JWT para que el revisor solo vea los suyos.
  // Llama a → [S-16] ExpedienteService.findBySectorResponsable
  @Get('revisor')
  @Roles(RolUser.REVISOR)
  @UseGuards(JwtAuthGuard, RolesGuard)
  getByRevisor(@Request() req,@Query('page') page=1,@Query('limit') limit=10) {
    const idSector: number = req.user.idSector;
    return this.expedienteService.findBySectorResponsable(idSector,{page,limit});
  }


  @Get('slug/:slug')
findBySlug(@Param('slug') slug: string) {
  console.log(slug);
  return this.expedienteService.findBySlug(slug);
}

  // [C-16] Actualiza solo los datos del formulario del expediente (JSON libre).
  // Ruta separada de PATCH /:id para no pisar otros campos del expediente.
  // Llama a → [S-17] ExpedienteService.updateFormulario
  @Patch(':id/formulario')
  updateFormulario(
    @Param('id', ParseIntPipe) id: number,
    @Body() datosFormulario: Record<string, any>,
  ) {
    return this.expedienteService.updateFormulario(id, datosFormulario);
  }

  // [C-17] Actualiza los campos principales del expediente (estado, etc.).
  // Llama a → [S-18] ExpedienteService.update
  @Patch(':id')
  update(@Param('id', ParseIntPipe) id: number, @Body() updateExpedienteDto: UpdateExpedienteDto) {
    return this.expedienteService.update(id, updateExpedienteDto);
  }

  // [C-18] Devuelve un expediente con todas sus relaciones cargadas (docs, revisores, etc.).
  // Va después de las rutas fijas para evitar colisiones.
  // Llama a → [S-19] ExpedienteService.findOne
  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.expedienteService.findOne(id);
  }

  // [C-19] Elimina un expediente.
  // Llama a → [S-20] ExpedienteService.remove
  @Delete(':id')
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.expedienteService.remove(id);
  }
}
