// src/documento/documento.controller.ts
import {Controller, Post,Get,Patch,Delete,Param, Body, UploadedFile, UseInterceptors, ParseIntPipe, Res, HttpCode, HttpStatus, BadRequestException, Req} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { Response } from 'express';
import { DocumentoService } from './documento.service';
import { SubirDocumentoDto } from './dto/subir-documento.dto';
import { RevisarDocumentoDto } from './dto/revisar-documento.dto';
import { MAX_TAMANIO_BYTES, multerConfig } from '../config/multer.config';


@Controller('documentos')
export class DocumentoController {
  constructor(private readonly documentoService: DocumentoService) {}

  // POST /documentos/subir
  @Post('subir')
  @UseInterceptors(FileInterceptor('archivo', multerConfig))
  async subir(
    @UploadedFile() file: Express.Multer.File,
    @Body() dto: SubirDocumentoDto,
  ) {
    if (!file) {
      throw new BadRequestException(
        `Se requiere un archivo. Tamaño máximo: ${MAX_TAMANIO_BYTES / 1024 / 1024} MB`,
      );
    }
    return this.documentoService.subirArchivo(dto, file);
  }

  // GET /documentos/expediente/:idExpediente
  @Get('expediente/:idExpediente')
  findByExpediente(@Param('idExpediente', ParseIntPipe) idExpediente: number) {
    return this.documentoService.findByExpediente(idExpediente);
  }

  // GET /documentos/:id
  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.documentoService.findOne(id);
  }

  // GET /documentos/:id/descargar
  @Get(':id/descargar')
  async descargar(
    @Param('id', ParseIntPipe) id: number,
    @Res() res: Response,
  ) {
    const rutaAbsoluta = await this.documentoService.obtenerRutaParaDescarga(id);
  
    // sendFile maneja automáticamente Content-Type y Content-Disposition
    res.sendFile(rutaAbsoluta);
  }

@Patch(':id/revisar')
revisar(
  @Param('id', ParseIntPipe) id: number,
  @Body() dto: RevisarDocumentoDto,
  @Req() req: Request,
) {
  const idUsuarioRevisor = (req as any).user.userId;//Obtenemos el id del usuario que solicito la revisión
  console.log('ID del usuario revisor:', idUsuarioRevisor);
  return this.documentoService.revisarDocumento(id, idUsuarioRevisor, dto);
}

  // DELETE /documentos/:id
  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  eliminar(@Param('id', ParseIntPipe) id: number) {
    return this.documentoService.eliminar(id);
  }
}