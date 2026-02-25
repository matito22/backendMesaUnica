// mail.controller.ts
import { Controller, Post, Body } from '@nestjs/common';
import { MailDto } from './dto/mail.dto';
import { ResendMailDto } from './dto/resend-mail.dto';
import { MailService } from './mail.service'; // ✅ Importa MailService directo
import { Public } from 'src/auth/public-key';

@Controller('mail')
export class MailController {
  constructor(private readonly mailService: MailService) {} // ✅ Inyecta MailService

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


  @Post('resend-email')
  async resendMail(@Body() resendMailDto: ResendMailDto): Promise<{ message: string, email: string }> {
    return await this.mailService.resendMail(
      resendMailDto.idContribuyente,
      resendMailDto.newEmail,
      resendMailDto.subject,
    );
  }


}    