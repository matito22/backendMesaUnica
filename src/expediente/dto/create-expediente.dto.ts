import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsEnum, IsInt, IsNotEmpty, IsOptional, IsString, MaxLength } from 'class-validator';
import { EstadoExpediente } from 'src/enum/estado-expediente';


export class CreateExpedienteDto {

    @ApiProperty({description: 'ID del contribuyente',example: 1})
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

}