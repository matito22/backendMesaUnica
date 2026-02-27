// src/documento/dto/revisar-documento.dto.ts
import { IsEnum, IsOptional, IsString, MaxLength } from 'class-validator';
import { EstadoDocumento } from 'src/enum/estado-documento';

export class RevisarDocumentoDto {
  @IsEnum([EstadoDocumento.APROBADO, EstadoDocumento.PENDIENTE_RESUBIDA], {
    message: 'El estado debe ser APROBADO o PENDIENTE_RESUBIDA',
  })
  estado: EstadoDocumento.APROBADO | EstadoDocumento.PENDIENTE_RESUBIDA;

  @IsOptional()
  @IsString()
  @MaxLength(1000)
  observacion?: string;
}
