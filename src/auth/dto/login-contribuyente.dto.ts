import { ApiProperty } from "@nestjs/swagger";
import { IsEmail, IsNotEmpty, IsString } from "class-validator";

export class LoginContribuyenteDto {
    @ApiProperty({ example: 'matiasagustintosi@gmail.com' })
    @IsEmail()
    @IsNotEmpty()
    email: string;

    @ApiProperty({ example: 'lukascapo1' })
    @IsString()
    @IsNotEmpty()
    password: string;
}