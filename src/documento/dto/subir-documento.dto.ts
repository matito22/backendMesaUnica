// src/documento/dto/subir-documento.dto.ts
import { IsInt, IsNotEmpty, IsPositive } from 'class-validator';
import { Type } from 'class-transformer';

export class SubirDocumentoDto {


  @Type(() => Number)
  @IsInt()
  @IsPositive()
  @IsNotEmpty()
  idTipoDocumento: number;
}