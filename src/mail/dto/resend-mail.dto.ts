import { ApiProperty } from "@nestjs/swagger";
import { IsNumber, IsString, IsOptional, IsEmail } from "class-validator";

export class ResendMailDto {
  @ApiProperty({ example: 1, description: 'ID del contribuyente' })
  @IsNumber()
  idContribuyente: number;

  @ApiProperty({ 
    example: 'correo.nuevo@gmail.com', 
    description: 'Nuevo email del contribuyente (opcional)',
    required: false 
  })
  @IsOptional()
  @IsEmail()
  newEmail?: string;

  @ApiProperty({ 
    example: 'Bienvenido', 
    description: 'Asunto del email',
    required: false 
  })
  @IsOptional()
  @IsString()
  subject?: string;
}
