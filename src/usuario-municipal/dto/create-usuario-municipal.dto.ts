import { ApiProperty } from "@nestjs/swagger";
import { IsBoolean, IsEnum, IsNotEmpty, IsNumber, IsString, MinLength, IsOptional } from "class-validator";
import { RolUser } from "src/enum/rol-user";
import { SectorMunicipal } from "src/sector-municipal/entities/sector-municipal.entity";

export class CreateUsuarioMunicipalDto {

    @ApiProperty({ example: 'admin_test' })
     @IsString()
    @IsNotEmpty()
    nombre: string;

 
    @ApiProperty({ example: 'matiasagustin@gmail.com' })
    @IsString()
    @IsNotEmpty()
    email: string;


    // el rol se asigna automáticamente en el servicio según el sector;
    // el cliente no debe confiar en este valor
    @ApiProperty({ example: RolUser.MESA_ENTRADA, required: false })
    @IsEnum(RolUser)
    @IsOptional()
    rol?: RolUser;

    @ApiProperty({example:1})
    @IsNumber()
    sector: number;


}
