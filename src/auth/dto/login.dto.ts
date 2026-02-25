import { ApiProperty } from "@nestjs/swagger";
import { IsNotEmpty, IsString } from "class-validator";


export class LoginDto {

    @ApiProperty({ example: 'admin_test' })
    @IsString()
    @IsNotEmpty()
    nombre: string;

    @ApiProperty({ example: 'password'})
    @IsString()
    @IsNotEmpty()
    password: string;
}