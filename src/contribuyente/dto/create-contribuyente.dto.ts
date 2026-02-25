import { ApiProperty } from "@nestjs/swagger";
import { IsBoolean, IsNotEmpty, IsString } from "class-validator";

export class CreateContribuyenteDto {

    @ApiProperty({ example: '40894005'})
    @IsString()
    @IsNotEmpty()
    dni: string;


    @ApiProperty({ example: 'Juan'})
    @IsString()
    @IsNotEmpty()
    nombre: string;


    @ApiProperty({ example: 'Perez'})
    @IsString()
    @IsNotEmpty()
    apellido: string;

    @ApiProperty({ example: 'juanperez@gmail.com'})
    @IsString()
    @IsNotEmpty()
    email: string;


    

}   
