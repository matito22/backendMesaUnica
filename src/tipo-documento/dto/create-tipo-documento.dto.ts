import { ApiProperty } from "@nestjs/swagger";
import { IsBoolean, IsNotEmpty, IsNumber, IsString } from "class-validator";

export class CreateTipoDocumentoDto {

    @ApiProperty({ example: 'Nota con requerimiento de tramite e identificacion Catastral' })
    @IsString()
    @IsNotEmpty()
    nombre: string;

    @ApiProperty({ example:'Descripcion de la nota' })
    @IsString()
    @IsNotEmpty()
    descripcion: string;

    @ApiProperty({ example: true })
    @IsBoolean()
    esObligatorio: boolean;

    @ApiProperty({ example: true })
    @IsBoolean()
    activo: boolean;


    @ApiProperty({ example: 1 })
    @IsNumber()
    idSectorResponsable: number;
}
