import { ApiProperty } from "@nestjs/swagger";
import { IsEnum, IsNumber } from "class-validator";


export class CambiarEstadoDto {

    @ApiProperty({description: 'ID del expediente',example: 3})
    @IsNumber()
    idExpediente:number;
    

}