import { IsEmail, IsEnum } from "class-validator";

export class ForgotPasswordDto {
  @IsEmail()
  email: string;

  @IsEnum(['municipal', 'contribuyente'])
  userType: 'municipal' | 'contribuyente';
}