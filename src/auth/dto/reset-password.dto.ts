import { IsEmail, IsEnum, IsString, MinLength } from "class-validator";

export class ResetPasswordDto {
  @IsEmail()
  email: string;

  @IsString()
  token: string;

  @IsString()
  @MinLength(8)
  newPassword: string;

  @IsEnum(['municipal', 'contribuyente'])
  userType: 'municipal' | 'contribuyente';
}