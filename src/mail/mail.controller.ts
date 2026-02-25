// mail.controller.ts
import { Controller, Post, Body } from '@nestjs/common';
import { MailDto } from './dto/mail.dto';
import { MailService } from './mail.service'; // ✅ Importa MailService directo

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
}    