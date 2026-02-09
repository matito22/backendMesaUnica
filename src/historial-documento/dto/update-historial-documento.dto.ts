import { PartialType } from '@nestjs/swagger';
import { CreateHistorialDocumentoDto } from './create-historial-documento.dto';

export class UpdateHistorialDocumentoDto extends PartialType(CreateHistorialDocumentoDto) {}
