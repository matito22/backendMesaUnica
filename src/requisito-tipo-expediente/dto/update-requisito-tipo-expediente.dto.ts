import { IsBoolean } from "class-validator";

export class UpdateRequisitoTipoExpedienteDto {
  @IsBoolean({ message: 'esObligatorio debe ser un booleano' })
  esObligatorio: boolean;
}
