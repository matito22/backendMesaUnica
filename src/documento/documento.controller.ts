import {
  Controller, Post, Get, Patch, Delete, Param, Body,
  UploadedFile, UseInterceptors, ParseIntPipe, Res,
  HttpCode, HttpStatus, BadRequestException, Req, UseGuards, Request
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { Response } from 'express';
import { DocumentoService } from './documento.service';
import { SubirDocumentoDto } from './dto/subir-documento.dto';
import { RevisarDocumentoDto } from './dto/revisar-documento.dto';
import { MAX_TAMANIO_BYTES } from '../config/multer.config';
import { RolUser } from 'src/enum/rol-user';
import { Roles } from 'src/auth/roles.decorator';
import { JwtAuthGuard } from 'src/auth/jwt-auth.guard';
import { RolesGuard } from 'src/auth/roles.guard';
import { UploadDinamicoInterceptor } from 'src/utils/upload-dinamica.interceptor';

@Controller('documentos')
export class DocumentoController {
  constructor(private readonly documentoService: DocumentoService) {}

  // [C-20] Sube un archivo al servidor. FileInterceptor procesa el multipart antes de entrar.
  // Llama a → [S-21] DocumentoService.subirArchivo
// documento.controller.ts
  @Post('subir/:idExpediente')
  @UseInterceptors(UploadDinamicoInterceptor)
  async subir(
    @Param('idExpediente') idExpediente: number,
    @UploadedFile() file: Express.Multer.File,
    @Body() dto: SubirDocumentoDto,
  ) {
    if (!file) {
      throw new BadRequestException(`Se requiere un archivo. Tamaño máximo: ${MAX_TAMANIO_BYTES / 1024 / 1024} MB`);
    }
    return this.documentoService.subirArchivo(dto, file, +idExpediente);
  }

  // [C-21] Devuelve todos los documentos de un expediente.
  // Llama a → [S-22] DocumentoService.findByExpediente
  @Get('expediente/:idExpediente')
  findByExpediente(@Param('idExpediente', ParseIntPipe) idExpediente: number) {
    return this.documentoService.findByExpediente(idExpediente);
  }

  // [C-22] Devuelve un documento con sus relaciones.
  // Llama a → [S-23] DocumentoService.findOne
  @Get('slug/:slug')
  findOneBySlug(@Param('slug') slug: string) {
    return this.documentoService.findOneBySlug(slug);
  }


  // [C-23] Descarga el archivo físico del servidor.
  // Llama a → [S-24] DocumentoService.obtenerRutaParaDescarga
  @Get('slug/:slug/descargar')
  async descargarBySlug(@Param('slug') slug: string, @Res() res: Response) {
    const rutaAbsoluta = await this.documentoService.obtenerRutaParaDescargaBySlug(slug);
    res.sendFile(rutaAbsoluta);
  }

    // [C-24] El revisor aprueba o rechaza un documento. Solo REVISOR y ADMIN pueden hacerlo.
  // El idUsuario viene del JWT para asegurarnos de que quien firma la revisión es quien está logueado.
  // Llama a → [S-25] DocumentoService.revisarDocumento
  @Patch('slug/:slug/revisar')
  revisarBySlug(@Param('slug') slug: string, @Body() dto: RevisarDocumentoDto, @Request() req) {
    const idUsuario: number = req.user.userId;
    return this.documentoService.revisarDocumentoBySlug(slug, dto, idUsuario);
  }


  // [C-25] Elimina el documento de la DB y su archivo físico del servidor.
  // Llama a → [S-26] DocumentoService.eliminar
  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  eliminar(@Param('id', ParseIntPipe) id: number) {
    return this.documentoService.eliminar(id);
  }
}
