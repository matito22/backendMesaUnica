import { Controller, Get, Post, Body, Patch, Param, Delete, ParseIntPipe, HttpCode, HttpStatus } from '@nestjs/common';
import { DocumentoService } from './documento.service';
import { CreateDocumentoDto } from './dto/create-documento.dto';
import { UpdateDocumentoDto } from './dto/update-documento.dto';
import { EstadoDocumento } from '../enum/estado-documento';
import { IsEnum, IsOptional, IsString, IsInt } from 'class-validator';

// DTO inline para el cambio de estado (podés moverlo a dto/cambiar-estado-documento.dto.ts)
class CambiarEstadoDto {
  @IsEnum(EstadoDocumento)
  estado: EstadoDocumento;

  @IsOptional()
  @IsString()
  observacion?: string;

  @IsOptional()
  @IsInt()
  idUsuarioRevisor?: number;
}

@Controller('documento')
export class DocumentoController {
  constructor(private readonly documentoService: DocumentoService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  create(@Body() createDocumentoDto: CreateDocumentoDto) {
    return this.documentoService.create(createDocumentoDto);
  }

  @Get()
  findAll() {
    return this.documentoService.findAll();
  }

  // Rutas específicas ANTES de /:id
  @Get('expediente/:idExpediente')
  findByExpediente(@Param('idExpediente', ParseIntPipe) idExpediente: number) {
    return this.documentoService.findByExpediente(idExpediente);
  }

  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.documentoService.findByExpediente(id);
  }

  @Patch(':id')
  update(@Param('id', ParseIntPipe) id: number, @Body() updateDocumentoDto: UpdateDocumentoDto) {
    return this.documentoService.update(id, updateDocumentoDto);
  }

  // Endpoint específico para cambiar estado con observación (usado por revisores)
  @Patch(':id/estado')
  cambiarEstado(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: CambiarEstadoDto,
  ) {
    return this.documentoService.cambiarEstado(
      id,
      dto.estado,
      dto.idUsuarioRevisor,
      dto.observacion,
    );
  }

  @Delete(':id')
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.documentoService.remove(id);
  }
}