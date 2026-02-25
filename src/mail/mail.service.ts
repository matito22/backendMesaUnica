import { MailerService } from '@nestjs-modules/mailer';
import { Injectable } from '@nestjs/common';


@Injectable()
export class MailService {
    constructor(private readonly mailService: MailerService) {}

    async sendMail(
        to: string,
        subject: string,
        template: string,
        context:object,

    ): Promise<void> {
        await this.mailService.sendMail({
            to,
            subject,
            template,
            context,
        });
        
    }
}