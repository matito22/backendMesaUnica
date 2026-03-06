import { Controller, Post, Body } from '@nestjs/common';
import { MailDto } from './dto/mail.dto';
import { ResendMailDto } from './dto/resend-mail.dto';
import { MailService } from './mail.service';
import { Public } from 'src/auth/public-key';

@Controller('mail')
export class MailController {
  constructor(private readonly mailService: MailService) {}

  // [C-40] Envía el email de bienvenida al contribuyente.
  // Normalmente AuthService [S-02] lo hace automáticamente, este endpoint es para forzarlo manualmente.
  // Llama a → [S-41] MailService.sendMail
  @Post('send-email')
  async sendMail(@Body() sendEmailDto: MailDto): Promise<{ message: string }> {
    await this.mailService.sendMail(
      sendEmailDto.to,
      'Bienvenido',
      './mailContribuyente',
      { nombre: sendEmailDto.nombre },
    );
    return { message: 'Email enviado' };
  }

  // [C-41] Reenvía el email de activación. Permite cambiar el email si estaba mal escrito.
  // Llama a → [S-42] MailService.resendMail
  @Post('resend-email')
  async resendMail(@Body() resendMailDto: ResendMailDto): Promise<{ message: string, email: string }> {
    return await this.mailService.resendMail(
      resendMailDto.idContribuyente,
      resendMailDto.newEmail,
      resendMailDto.subject,
    );
  }
}
