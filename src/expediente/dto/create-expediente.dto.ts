import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsEnum, IsInt, IsNotEmpty, IsOptional, IsString, MaxLength } from 'class-validator';
import { EstadoExpediente } from 'src/enum/estado-expediente';


export class CreateExpedienteDto {

    @ApiProperty({description: 'ID del contribuyente',example: 3})
    @IsInt()
    @IsNotEmpty()
    idContribuyente: number;

    @ApiProperty({description: 'Número GDE proporcionado por Mesa de Entrada',example: 'GDE-2024-001234-GDEBA-DPV', maxLength: 50})
    @IsString()
    @IsNotEmpty()
    @MaxLength(50)
    numeroGde: string;

    @ApiPropertyOptional({description: 'Estado del expediente',enum: EstadoExpediente, default: EstadoExpediente.EN_REVISION})
    @IsEnum(EstadoExpediente)
    @IsOptional()
    estado?: EstadoExpediente;

    @ApiPropertyOptional({description: 'ID del tipo de expediente',example: 1})
    @IsInt()
    @IsOptional()
    idTipoExpediente?: number;

    @ApiPropertyOptional({description: 'ID del expediente padre',example: 3})
    @IsInt()
    @IsOptional()
    idExpedientePadre?: number;

    @ApiPropertyOptional({description: 'Datos del formulario del trámite',example: {campo1: 'valor1', campo2: 'valor2'}})
    @IsOptional()    
    datosFormulario?: Record<string, any>;



}