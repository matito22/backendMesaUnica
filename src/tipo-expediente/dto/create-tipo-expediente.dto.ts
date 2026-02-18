import {
  IsString,
  IsNotEmpty,
  IsOptional,
  IsInt,
  IsBoolean,
  IsObject,
  MaxLength,
  Min,
} from 'class-validator';
import { PartialType, OmitType } from '@nestjs/mapped-types';


// ─────────────────────────────────────────────
// CREATE DTO
// ─────────────────────────────────────────────
export class CreateTipoExpedienteDto {
  @IsInt({ message: 'idSectorResponsable debe ser un número entero' })
  @Min(1)
  idSectorResponsable: number;

  @IsString()
  @IsNotEmpty({ message: 'El nombre no puede estar vacío' })
  @MaxLength(100, { message: 'El nombre no puede superar los 100 caracteres' })
  nombre: string;

  @IsOptional()
  @IsString()
  descripcion?: string;

  // JSON libre que define los campos del formulario del trámite
  // Ejemplo: { "campos": [{ "nombre": "superficieCubierta", "tipo": "number", "requerido": true }] }
  @IsOptional()
  @IsObject({ message: 'schemaFormulario debe ser un objeto JSON válido' })
  schemaFormulario?: Record<string, any>;
}