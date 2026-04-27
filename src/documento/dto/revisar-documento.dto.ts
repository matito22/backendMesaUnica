// src/documento/dto/revisar-documento.dto.ts
import { IsEnum, IsOptional, IsString, MaxLength } from 'class-validator';
import { EstadoDocumento } from '../../enum/estado-documento';


//Este DTO se utiliza en el controlador de revisar documento
export class RevisarDocumentoDto {
  @IsEnum([EstadoDocumento.APROBADO, EstadoDocumento.PENDIENTE_RESUBIDA,EstadoDocumento.SUBIDO_A_GDE], {
    message: 'El estado debe ser APROBADO , PENDIENTE_RESUBIDA o SUBIDO_A_GDE',
  })
  estado: EstadoDocumento.APROBADO | EstadoDocumento.PENDIENTE_RESUBIDA | EstadoDocumento.SUBIDO_A_GDE;

  @IsOptional()
  @IsString()
  @MaxLength(1000)
  observacion?: string;
}
