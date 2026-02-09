import { PartialType } from '@nestjs/swagger';
import { CreateMensajeDto } from './create-mensaje.dto';

export class UpdateMensajeDto extends PartialType(CreateMensajeDto) {}
