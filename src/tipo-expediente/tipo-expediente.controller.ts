import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Param,
  Body,
  ParseIntPipe,
  Query,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { TipoExpedienteService } from './tipo-expediente.service';
import { UpdateTipoExpedienteDto } from './dto/update-tipo-expediente.dto';
import { CreateTipoExpedienteDto } from './dto/create-tipo-expediente.dto';


// NOTA: Si tenés guards de autenticación, agregá @UseGuards(JwtAuthGuard) a nivel
// de controller o por endpoint según los roles que deben tener acceso.
// Ejemplo: solo ADMIN debería poder crear/modificar tipos de expediente.

@Controller('tipos-expediente')
export class TipoExpedienteController {
  constructor(private readonly tipoExpedienteService: TipoExpedienteService) {}



  // ─────────────────────────────────────────────
  // GET /tipos-expediente/:id
  // ─────────────────────────────────────────────
  @Get(':id')
  async findOne(
    @Param('id', ParseIntPipe) id: number,
  ){
    return this.tipoExpedienteService.findOne(id);
  }

  // ─────────────────────────────────────────────
  // POST /tipos-expediente
  // ─────────────────────────────────────────────
  @Post()
  @HttpCode(HttpStatus.CREATED)
  async create(
    @Body() dto: CreateTipoExpedienteDto,
  ) {
    return this.tipoExpedienteService.create(dto);
  }

  // ─────────────────────────────────────────────
  // PATCH /tipos-expediente/:id
  // Se usa PATCH (no PUT) porque la actualización es parcial
  // ─────────────────────────────────────────────
  @Patch(':id')
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateTipoExpedienteDto,
  ){
    return this.tipoExpedienteService.update(id, dto);
  }

  // ─────────────────────────────────────────────
  // DELETE /tipos-expediente/:id
  // No elimina el registro: aplica baja lógica (activo = false)
  // ─────────────────────────────────────────────
  @Delete(':id')
  @HttpCode(HttpStatus.OK)
  async deactivate(
    @Param('id', ParseIntPipe) id: number,
  ): Promise<{ mensaje: string }> {
    return this.tipoExpedienteService.deactivate(id);
  }
}