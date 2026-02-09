import { ApiProperty } from "@nestjs/swagger";
import { IsBoolean, IsNotEmpty, IsString } from "class-validator";

export class CreateSectorMunicipalDto {

    @ApiProperty({ example: 'Obras particulares' })
    @IsString()
    @IsNotEmpty()
    nombre: string;

    @ApiProperty({ example: true })
    @IsBoolean()
    activo: boolean;

}
