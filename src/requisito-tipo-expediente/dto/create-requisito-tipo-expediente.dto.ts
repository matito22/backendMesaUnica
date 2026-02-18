import { IsBoolean, IsInt, IsOptional, Min } from "class-validator";

export class CreateRequisitoTipoExpedienteDto {
  @IsInt({ message: 'idTipoExpediente debe ser un número entero' })
  @Min(1)
  idTipoExpediente: number;

  @IsInt({ message: 'idTipoDocumento debe ser un número entero' })
  @Min(1)
  idTipoDocumento: number;

  // Si no se manda, por defecto el requisito es obligatorio (igual que la BD)
  @IsOptional()
  @IsBoolean()
  esObligatorio?: boolean;
}