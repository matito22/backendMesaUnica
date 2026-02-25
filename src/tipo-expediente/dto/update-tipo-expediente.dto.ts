import { PartialType } from '@nestjs/swagger';
import { IsBoolean, IsOptional } from 'class-validator';
import { CreateTipoExpedienteDto } from './create-tipo-expediente.dto';

export class UpdateTipoExpedienteDto extends PartialType(
  CreateTipoExpedienteDto,
) {
  @IsOptional()
  @IsBoolean()
  activo?: boolean;
}
