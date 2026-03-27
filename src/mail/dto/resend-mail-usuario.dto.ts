import { ApiProperty } from "@nestjs/swagger";
import { IsNumber, IsString, IsOptional, IsEmail } from "class-validator";

export class ResendMailUsuarioDto {
  @ApiProperty({ example: 1, description: 'ID del usuario' })
  @IsNumber()
  idUsuario: number;

  @ApiProperty({ 
    example: 'correo.nuevo@gmail.com', 
    description: 'Nuevo email del usuario (opcional)',
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
