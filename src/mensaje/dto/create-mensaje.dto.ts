import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsBoolean, IsInt, IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class CreateMensajeDto {

    @ApiProperty({description: 'ID del expediente',example: 1})
    @IsInt()
    @IsNotEmpty()
    idExpediente: number;

    @ApiPropertyOptional({description: 'ID del usuario municipal (NULL si el mensaje es del contribuyente)',example: 3})
    @IsInt()
    @IsOptional()
    idUsuarioMunicipal?: number;

    @ApiProperty({description: 'Contenido del mensaje',example: 'Se requiere documentación adicional para continuar con el trámite'})
    @IsString()
    @IsNotEmpty()
    contenido: string;

    @ApiPropertyOptional({description: 'Indica si el mensaje fue leído',default: false})
    @IsBoolean()
    @IsOptional()
    leido?: boolean;

}