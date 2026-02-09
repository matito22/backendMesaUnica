import { ApiProperty } from "@nestjs/swagger";
import { IsBoolean, IsEnum, IsNotEmpty, IsNumber, IsString, MinLength } from "class-validator";
import { RolUser } from "src/enum/rol-user";
import { SectorMunicipal } from "src/sector-municipal/entities/sector-municipal.entity";

export class CreateUsuarioMunicipalDto {

    @ApiProperty({ example: 'mtosi' })
     @IsString()
    @IsNotEmpty()
    nombre: string;

    @ApiProperty({ example: '123456789'})
    @IsString()
    @IsNotEmpty()
    @MinLength(6)
    password: string;

    @ApiProperty({ example: 'matiasagustin@gmail.com' })
    @IsString()
    @IsNotEmpty()
    email: string;


    @ApiProperty({ example: true })
    @IsBoolean()
    activo: boolean;

    @ApiProperty({ example: RolUser.mesa_entrada })
    @IsEnum(RolUser)
    rol: RolUser;

    @ApiProperty({example:1})
    @IsNumber()
    sector: number;


}
