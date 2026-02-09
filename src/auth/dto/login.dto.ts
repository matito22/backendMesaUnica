import { ApiProperty } from "@nestjs/swagger";
import { IsNotEmpty, IsString } from "class-validator";


export class LoginDto {

    @ApiProperty({ example: 'mtosi' })
    @IsString()
    @IsNotEmpty()
    nombre: string;

    @ApiProperty({ example: '123456789'})
    @IsString()
    @IsNotEmpty()
    password: string;
}