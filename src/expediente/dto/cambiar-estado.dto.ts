import { ApiProperty } from "@nestjs/swagger";
import { IsEnum, IsNumber } from "class-validator";
import { EstadoExpediente } from "src/enum/estado-expediente";

export class CambiarEstadoDto {

    @ApiProperty({description: 'ID del expediente',example: 3})
    @IsNumber()
    idExpediente:number;
    

}