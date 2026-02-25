import { MailerService } from '@nestjs-modules/mailer';
import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { ContribuyenteService } from '../contribuyente/contribuyente.service';
import { v4 as uuidv4 } from 'uuid';


@Injectable()
export class MailService {
    constructor(
        private readonly mailService: MailerService,
        private readonly contribuyenteService: ContribuyenteService,
    ) {}

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

    async resendMail(
        idContribuyente: number,
        newEmail?: string,
        subject: string = 'Bienvenido al Sistema Municipal',
        template: string = './mailContribuyente',
    ): Promise<{ message: string, email: string }> {
        // Buscar el contribuyente
        const contribuyente = await this.contribuyenteService.findOne(idContribuyente);
        
        if (!contribuyente) {
            throw new NotFoundException(`Contribuyente with ID ${idContribuyente} not found`);
        }

        // Usar el nuevo email o el existente
        let emailToUse = newEmail || contribuyente.email;
        
        if (!emailToUse) {
            throw new BadRequestException('El contribuyente no tiene un email registrado y no se proporcionó uno nuevo');
        }

        // Actualizar el email si se proporciona uno nuevo
        if (newEmail && newEmail !== contribuyente.email) {
            contribuyente.email = newEmail;
            await this.contribuyenteService.save(contribuyente);
        }

        // Asegurar que exista un token de activación para poder incluir el activationUrl
        if (!contribuyente.activationToken) {
            contribuyente.activationToken = uuidv4();
            await this.contribuyenteService.save(contribuyente);
        }

        const activationUrl = `http://localhost:4200/activar?id=${contribuyente.idContribuyente}&code=${contribuyente.activationToken}`;

        // Enviar el mail incluyendo el activationUrl en el contexto
        await this.sendMail(
            emailToUse,
            subject,
            template,
            { nombre: contribuyente.nombre, activationUrl },
        );

        return { 
            message: 'Email reenviado correctamente',
            email: emailToUse,
        };
    }
}