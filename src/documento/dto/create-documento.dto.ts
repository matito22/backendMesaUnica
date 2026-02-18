import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsEnum, IsInt, IsNotEmpty, IsOptional, IsString, MaxLength } from 'class-validator';
import { EstadoDocumento } from 'src/enum/estado-documento';


export class CreateDocumentoDto {

  @ApiProperty({
    description: 'ID del expediente',
    example: 1
  })
  @IsInt()
  @IsNotEmpty()
  idExpediente: number;

  @ApiProperty({
    description: 'ID del tipo de documento',
    example: 2
  })
  @IsInt()
  @IsNotEmpty()
  idTipoDocumento: number;

  @ApiPropertyOptional({
    description: 'Nombre original del archivo',
    example: 'DNI_frente.pdf',
    maxLength: 255
  })
  @IsString()
  @MaxLength(255)
  @IsOptional()
  nombreArchivo?: string;

  @ApiPropertyOptional({
    description: 'Ruta de almacenamiento (path físico o URL S3)',
    example: '/uploads/documentos/2024/01/file123.pdf',
    maxLength: 500
  })
  @IsString()
  @MaxLength(500)
  @IsOptional()
  rutaAlmacenamiento?: string;

  @ApiPropertyOptional({
    description: 'Tipo MIME del archivo',
    example: 'application/pdf',
    maxLength: 50
  })
  @IsString()
  @MaxLength(50)
  @IsOptional()
  tipoMime?: string;

  @ApiPropertyOptional({
    description: 'Peso del archivo en KB',
    example: 1024
  })
  @IsInt()
  @IsOptional()
  pesoKb?: number;

  @ApiPropertyOptional({
    description: 'Estado del documento',
    enum: EstadoDocumento,
    default: EstadoDocumento.PENDIENTE_CARGA
  })
  @IsEnum(EstadoDocumento)
  @IsOptional()
  estado?: EstadoDocumento;

  @ApiPropertyOptional({
    description: 'Observación actual sobre el documento',
    example: 'Documento pendiente de revisión'
  })
  @IsString()
  @IsOptional()
  observacionActual?: string;
}