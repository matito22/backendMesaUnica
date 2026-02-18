import { PartialType } from "@nestjs/swagger";
import { IsBoolean, IsOptional } from "class-validator";
import { CreateTipoExpedienteDto } from "./create-tipo-expediente.dto";

export class UpdateTipoExpedienteDto extends PartialType(
  CreateTipoExpedienteDto,
) {
  // Permite activar o desactivar el tipo de expediente (baja lógica)
  @IsOptional()
  @IsBoolean()
  activo?: boolean;
}