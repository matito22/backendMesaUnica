// src/documento/dto/subir-documento.dto.ts

import { Type } from "class-transformer/types/decorators/type.decorator";
import { IsInt } from "class-validator";


export class DocumentoOpcionalDto {

    @IsInt()
    idTipoDocumento: number;


}