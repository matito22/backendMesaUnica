import { ApiProperty } from "@nestjs/swagger";
import { IsString } from "class-validator";


export class MailDto {

    @ApiProperty({ example: 'juanperez@gmail.com'})
    @IsString()
    to: string;

    @ApiProperty({ example: 'Juan'})
    @IsString()
    nombre: string;
}