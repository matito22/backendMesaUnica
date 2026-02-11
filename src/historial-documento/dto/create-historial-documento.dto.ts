import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsInt, IsNotEmpty, IsOptional, IsString, MaxLength } from 'class-validator';

export class CreateHistorialDocumentoDto {

    @ApiProperty({description: 'ID del documento',example: 1 })
    @IsInt()
    @IsNotEmpty()
    idDocumento: number;

    @ApiPropertyOptional({ description: 'ID del usuario que realizó el cambio (NULL si fue el contribuyente)',example: 5})
    @IsInt()
    @IsOptional()
    idUsuarioActor?: number;

    @ApiPropertyOptional({description: 'Estado anterior del documento',example: 'EN_REVISION',maxLength: 50})
    @IsString()
    @MaxLength(50)
    @IsOptional()
    estadoAnterior?: string;

    @ApiPropertyOptional({description: 'Estado nuevo del documento',example: 'APROBADO',maxLength: 50})
    @IsString()
    @MaxLength(50)
    @IsOptional()
    estadoNuevo?: string;

    @ApiPropertyOptional({description: 'Observación o comentario del cambio',example: 'Documento aprobado correctamente'})
    @IsString()
    @IsOptional()
    observacion?: string;

}