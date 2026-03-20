import { Module } from '@nestjs/common';
import { MailerModule } from '@nestjs-modules/mailer';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { HandlebarsAdapter } from '@nestjs-modules/mailer/dist/adapters/handlebars.adapter';
import { join } from 'path';
import { MailService } from './mail.service';
import { MailController } from './mail.controller';
import { ContribuyenteModule } from '../contribuyente/contribuyente.module';
import { ExpedienteModule } from 'src/expediente/expediente.module';

@Module({
    imports: [
        MailerModule.forRootAsync({
            imports: [ConfigModule],
            useFactory: async (configService: ConfigService) => ({
                transport: {
                    host: configService.get('MAIL_HOST'),
                    port: 465,
                    secure:true,
                    
                    auth: {
                        user: configService.get('MAIL_USER'),
                        pass: configService.get('MAIL_PASS'),
                    },
                },
                defaults: {
                    from: `${configService.get<string>('MAIL_FROM')} <${configService.get<string>('MAIL_USER')}>`,
                },
                template: {
                    dir: join(__dirname, '..', 'templates'),
                    adapter: new HandlebarsAdapter(),
                    options: {
                        strict: true,//Si el template tiene 2 parametros pero mandamos uno, nos indica un error
                    },
                },
            }),
            inject: [ConfigService],
        }),
        ContribuyenteModule,
        ExpedienteModule
    ],
  providers: [MailService],
  exports: [MailService],
  controllers: [MailController],
})
export class MailModule {}