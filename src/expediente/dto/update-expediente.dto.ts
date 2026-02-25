import { IsEnum, IsOptional, IsDateString } from 'class-validator';
import { PartialType } from '@nestjs/swagger';
import { CreateExpedienteDto } from './create-expediente.dto';
import { EstadoExpediente } from '../../enum/estado-expediente';

export class UpdateExpedienteDto extends PartialType(CreateExpedienteDto) {

  // Estos campos no están en el CreateDto porque solo se modifican al actualizar
  @IsOptional()
  @IsEnum(EstadoExpediente)
  estado?: EstadoExpediente;

  @IsOptional()
  @IsDateString()
  fechaFinalizacion?: string;
}