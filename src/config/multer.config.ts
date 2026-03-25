// src/documento/config/multer.config.ts
import { diskStorage } from 'multer';
import { extname, join } from 'path';
import { BadRequestException } from '@nestjs/common';
import { Request } from 'express';
import { mkdirSync } from 'fs';

export type PerfilSubida = 'EDITABLE' | 'SOLO_LECTURA';

const REGLAS = {
  EDITABLE: {
    mimeTypes: [
      'application/pdf',
      'application/acad', 'application/x-acad',
      'application/autocad_dwg', 'application/dwg',
      'application/x-dwg', 'image/vnd.dwg', 'drawing/dwg',
    ],
    extensiones: ['.pdf', '.dwg'],
    descripcion: 'PDF, DWG',
  },
  SOLO_LECTURA: {
    mimeTypes: [
      'application/pdf',
      'application/dxf', 'application/x-dxf', 'image/vnd.dxf',
      'application/dwf',
    'application/x-dwf',
    'model/vnd.dwf',
    'drawing/dwf',
    ],
    extensiones: ['.pdf', '.dxf','.dwf'],
    descripcion: 'PDF, DXF, DWF',
  },
};

export const MAX_TAMANIO_BYTES = 50 * 1024 * 1024;

export function crearMulterConfig(perfil: PerfilSubida) {
  const reglas = REGLAS[perfil];

  return {
    storage: diskStorage({
    destination: (_req: Request, _file: Express.Multer.File, cb) => {
        const ahora = new Date();
        const carpeta = join(
          process.env.STORAGE_PATH ?? join(process.cwd(), 'uploads'), // fallback local
          String(ahora.getFullYear()),
          String(ahora.getMonth() + 1).padStart(2, '0'),
        );
        mkdirSync(carpeta, { recursive: true });
        cb(null, carpeta);
      },
      filename: (_req: Request, file: Express.Multer.File, cb) => {
        const ext = extname(file.originalname).toLowerCase();
        cb(null, `${Date.now()}-${Math.round(Math.random() * 1e9)}${ext}`);
      },
    }),

    fileFilter: (_req: Request, file: Express.Multer.File, cb: any) => {
      const ext = extname(file.originalname).toLowerCase();
      const mimeOk = reglas.mimeTypes.includes(file.mimetype);
      const octetOk = file.mimetype === 'application/octet-stream' && reglas.extensiones.includes(ext);

      if (!mimeOk && !octetOk) {
        return cb(
          new BadRequestException(
            `Archivo no permitido: "${file.mimetype}" (${ext}). Tu sector acepta: ${reglas.descripcion}`
          ),
          false,
        );
      }
      cb(null, true);
    },

    limits: { fileSize: MAX_TAMANIO_BYTES, files: 1 },
  };
}