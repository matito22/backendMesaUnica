import { Type } from "class-transformer"
import { IsNotEmpty, IsNumber, IsString, IsUUID } from "class-validator"

export class ActivateContribuyenteDto {

    @IsNotEmpty()
    @IsNumber()
    @Type(() => Number)
    id:number

    @IsNotEmpty()
    @IsUUID('4')
    code: string

    @IsString()
    @IsNotEmpty()
    password: string
}