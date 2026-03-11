import { ApiProperty } from "@nestjs/swagger";
import { IsNumber, IsString } from "class-validator";

export class CorreccionDocumentoDto {

     @ApiProperty({ example: '1'})
     @IsNumber()
     idExpediente: number;

     // El frontend envía la cadena de observación que se agregó al solicitar la corrección.
     // Puede estar vacía, por eso la hacemos opcional y con default null.
     @ApiProperty({ example: 'El archivo tiene que mostrarse legible', required: false })
     @IsString()
     observacion?: string | null;

}