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

  // [S-41] Envía cualquier email usando las plantillas .hbs de /src/templates/.
  // Lo llaman AuthService [S-02] y MailController [C-40].
  async sendMail(to: string, subject: string, template: string, context: object): Promise<void> {
    await this.mailService.sendMail({ to, subject, template, context });
  }

  // [S-42] Reenvía el email de activación. Actualiza el email si se provee uno nuevo.
  // Si el activationToken fue consumido, genera uno nuevo antes de enviar.
  async resendMail(
    idContribuyente: number,
    newEmail?: string,
    subject: string = 'Bienvenido al Sistema Municipal',
    template: string = './mailContribuyente',
  ): Promise<{ message: string, email: string }> {
    const contribuyente = await this.contribuyenteService.findOne(idContribuyente);

    if (!contribuyente) throw new NotFoundException(`Contribuyente with ID ${idContribuyente} not found`);

    let emailToUse = newEmail || contribuyente.email; // Usa el nuevo email si se proporcionó, si no el existente

    if (!emailToUse) throw new BadRequestException('El contribuyente no tiene un email registrado y no se proporcionó uno nuevo');

    if (newEmail && newEmail !== contribuyente.email) {
      contribuyente.email = newEmail; // Actualizamos el email si fue corregido
      await this.contribuyenteService.save(contribuyente);
    }

    if (!contribuyente.activationToken) {
      contribuyente.activationToken = uuidv4(); // Regeneramos el token si ya fue consumido
      await this.contribuyenteService.save(contribuyente);
    }

    const activationUrl = `http://localhost:4200/activar?id=${contribuyente.idContribuyente}&code=${contribuyente.activationToken}`;

    await this.sendMail(emailToUse, subject, template, { nombre: contribuyente.nombre, activationUrl });

    return { message: 'Email reenviado correctamente', email: emailToUse };
  }
}
