import { MailerService } from '@nestjs-modules/mailer';
import { Injectable, NotFoundException, BadRequestException, ConflictException } from '@nestjs/common';
import { ContribuyenteService } from '../contribuyente/contribuyente.service';
import { v4 as uuidv4 } from 'uuid';
import { ExpedienteService } from '../expediente/expediente.service';
import MailComposer = require('nodemailer/lib/mail-composer');
import { ImapFlow } from 'imapflow';
import { UsuarioMunicipalService } from 'src/usuario-municipal/usuario-municipal.service';
import { QueryFailedError } from 'typeorm';

@Injectable()
export class MailService {
  constructor(
    private readonly mailService: MailerService,
    private readonly contribuyenteService: ContribuyenteService,
    private readonly expedienteService: ExpedienteService,
    private readonly usuarioMunicipalService: UsuarioMunicipalService,
  ) {}

  // [S-41] Envía cualquier email usando las plantillas .hbs de /src/templates/.
  // Lo llaman AuthService [S-02] y MailController [C-40].
  /*async sendMail(to: string, subject: string, template: string, context: object): Promise<void> {
    await this.mailService.sendMail({ to, subject, template, context });
  }*/

    async sendMail(to: string, subject: string, template: string, context: object): Promise<any> {
    const result = await this.mailService.sendMail({ to, subject, template, context });
      try {
        await this.saveToSent({ from: process.env.MAIL_FROM, to, subject });
      } catch (e) {
        console.warn('No se pudo guardar en enviados:', e.message);
      }
    return result;
}

  // [S-42] Reenvía el email de activación. Actualiza el email si se provee uno nuevo.
  // Si el activationToken fue consumido, genera uno nuevo antes de enviar.
  async resendMail(
  idContribuyente: number,
  newEmail?: string,
  subject: string = 'Bienvenido al Sistema Municipal',
  template: string = './mailResend',
): Promise<{ message: string, email: string }> {
  const contribuyente = await this.contribuyenteService.findOne(idContribuyente);

  if (!contribuyente) throw new NotFoundException(`Contribuyente with ID ${idContribuyente} not found`);


  if (contribuyente.activo) throw new ConflictException('El contribuyente ya tiene su cuenta activa.');

  let emailToUse = newEmail || contribuyente.email;

  if (!emailToUse) throw new BadRequestException('El contribuyente no tiene un email registrado y no se proporcionó uno nuevo');

  if (newEmail && newEmail !== contribuyente.email) {
    contribuyente.email = newEmail;
    try {
      await this.contribuyenteService.save(contribuyente);
    } catch (error) {
      if (error instanceof QueryFailedError && (error as any).driverError?.code === 'ER_DUP_ENTRY') {
        throw new ConflictException('El email ingresado ya está en uso por otro contribuyente.');
      }
      throw error;
    }
  }

  if (!contribuyente.activationToken) {
    contribuyente.activationToken = uuidv4();
    await this.contribuyenteService.save(contribuyente);
  }

  const activationUrl = `${process.env.CORS_ORIGIN}/activar?id=${contribuyente.idContribuyente}&code=${contribuyente.activationToken}`;
  await this.sendMail(emailToUse, subject, template, { nombre: contribuyente.nombre, activationUrl });

  return { message: 'Email reenviado correctamente', email: emailToUse };
}


async resendMailUsuario(
  idUsuario: number,
  newEmail?: string,
  subject: string = 'Bienvenido al Sistema Municipal',
  template: string = './mailResend',
): Promise<{ message: string, email: string }> {
  const usuario = await this.usuarioMunicipalService.findOne(idUsuario);

  if (!usuario) throw new NotFoundException(`Usuario with ID ${idUsuario} not found`);

  // ✅ Verificar que no esté activo
  if (usuario.activo) throw new ConflictException('El usuario ya tiene su cuenta activa.');

  let emailToUse = newEmail || usuario.email;

  if (!emailToUse) throw new BadRequestException('El usuario no tiene un email registrado y no se proporcionó uno nuevo');

  if (newEmail && newEmail !== usuario.email) {
    usuario.email = newEmail;
    try {
      await this.usuarioMunicipalService.save(usuario);
    } catch (error) {
      if (error instanceof QueryFailedError && (error as any).driverError?.code === 'ER_DUP_ENTRY') {
        throw new ConflictException('El email ingresado ya está en uso por otro usuario.');
      }
      throw error;
    }
  }

  if (!usuario.activationToken) {
    usuario.activationToken = uuidv4();
    await this.usuarioMunicipalService.save(usuario);
  }

  const activationUrl = `${process.env.CORS_ORIGIN}/activar?id=${usuario.idUsuario}&code=${usuario.activationToken}`;
  await this.sendMail(emailToUse, subject, template, { nombre: usuario.nombre, activationUrl });

  return { message: 'Email reenviado correctamente', email: emailToUse };
}


   // [S-43] Envía el correo de corrección de documento.
   // Llama a → [S-41] MailService.sendMail
  async correccionDocumento(
    idExpediente: number,
    observacion: string | null = null,
  ): Promise<{ message: string; email: string }> {
    // obtenemos el expediente con todos sus documentos
    const expediente = await this.expedienteService.findOne(idExpediente);
    if (!expediente) throw new NotFoundException(`Expediente with ID ${idExpediente} not found`);

    // buscamos el documento más recientemente modificado (el que se acaba de justamente revisar)
    const documento = expediente.documentos?.sort(
      (a, b) => new Date(b.fechaRevision || 0).getTime() - new Date(a.fechaRevision || 0).getTime(),
    )?.[0];

    if (!documento) throw new NotFoundException(`No hay documentos en el expediente ${idExpediente}`);

    const contribuyente = expediente.contribuyente;
    if (!contribuyente) throw new NotFoundException(`Contribuyente for expediente ${idExpediente} not found`);

    const emailToUse = contribuyente.email;
    if (!emailToUse)
      throw new BadRequestException(
        'El contribuyente no tiene un email registrado y no se proporcionó uno nuevo',
      );

    // preparamos contexto de la plantilla
    const context: any = {
      nombre: contribuyente.nombre,
      expedienteNumero: expediente.numeroGde || `#${expediente.idExpediente}`,
      documentoNombre:
        documento.nombreArchivo || documento.tipoDocumento?.nombre || `ID ${documento.idDocumento}`,
    };
    if (observacion) {
      context.observacion = observacion;
    }

    await this.sendMail(
      emailToUse,
      'Corrección de documento',
      './mailCorreccionDocumento',
      context,
    );

    return { message: 'Email enviado correctamente', email: emailToUse };
  }



  async saveToSent(mailOptions: object): Promise<void> {
  // 1. Construís el raw RFC2822 del mensaje
  const mail = new MailComposer(mailOptions);
  const rawMessage: Buffer = await new Promise((resolve, reject) => {
    mail.compile().build((err, msg) => (err ? reject(err) : resolve(msg)));
  });

  // 2. Lo subís a la carpeta Sent por IMAP
  const client = new ImapFlow({
    host: process.env.MAIL_HOST!,
    port: 993,
    logger: false, 
    secure: true,
    auth: {
      user: process.env.MAIL_USER!,
      pass: process.env.MAIL_PASS,
    },
  });

  await client.connect();
  await client.append('Sent', rawMessage, ['\\Seen']); // \\Seen = marcar como leído
  await client.logout();
}


}
