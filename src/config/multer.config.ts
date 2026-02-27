// src/documento/config/multer.config.ts
import { diskStorage } from 'multer';
import { extname, join } from 'path';
import { BadRequestException } from '@nestjs/common';
import { Request } from 'express';
import { mkdirSync } from 'fs';

const MIME_TYPES_PERMITIDOS = [
  // Documentos
  'application/pdf',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  // Imágenes
  'image/jpeg',
  'image/png',
  'image/webp',
  // AutoCAD DWG — distintos OS envían distintos MIME types para el mismo formato
  'application/acad',
  'application/x-acad',
  'application/autocad_dwg',
  'application/dwg',
  'application/x-dwg',
  'image/vnd.dwg',
  'drawing/dwg',
  // AutoCAD DXF
  'application/dxf',
  'application/x-dxf',
  'image/vnd.dxf',
];

// Extensiones que se aceptan como fallback (cuando el MIME viene como octet-stream)
const EXTENSIONES_PERMITIDAS = [
  '.pdf', '.doc', '.docx',
  '.jpg', '.jpeg', '.png', '.webp',
  '.dwg', '.dxf',
];

export const MAX_TAMANIO_BYTES = 50 * 1024 * 1024; // 50 MB (AutoCAD puede ser grande)

export const multerConfig = {
  storage: diskStorage({
    destination: (req: Request, file: Express.Multer.File, callback) => {
      const ahora = new Date();
      const carpeta = join(
        process.cwd(),
        'uploads',
        String(ahora.getFullYear()),
        String(ahora.getMonth() + 1).padStart(2, '0'),
      );
      mkdirSync(carpeta, { recursive: true });
      callback(null, carpeta);
    },

    filename: (req: Request, file: Express.Multer.File, callback) => {
      const extension = extname(file.originalname).toLowerCase();
      const timestamp = Date.now();
      const random = Math.round(Math.random() * 1e9);
      callback(null, `${timestamp}-${random}${extension}`);
    },
  }),

  fileFilter: (
    req: Request,
    file: Express.Multer.File,
    callback: (error: Error | null, aceptar: boolean) => void,
  ) => {
    const extension = extname(file.originalname).toLowerCase();
    const mimePermitido = MIME_TYPES_PERMITIDOS.includes(file.mimetype);

    // AutoCAD a veces llega como application/octet-stream; validar por extensión
    const esOctetStreamValido =
      file.mimetype === 'application/octet-stream' &&
      EXTENSIONES_PERMITIDAS.includes(extension);

    if (!mimePermitido && !esOctetStreamValido) {
      return callback(
        new BadRequestException(
          `Tipo de archivo no permitido: "${file.mimetype}" (${extension}). ` +
          `Formatos aceptados: PDF, DOC, DOCX, JPG, PNG, WEBP, DWG, DXF`,
        ),
        false,
      );
    }

    callback(null, true);
  },

  limits: {
    fileSize: MAX_TAMANIO_BYTES,
    files: 1,
  },
};