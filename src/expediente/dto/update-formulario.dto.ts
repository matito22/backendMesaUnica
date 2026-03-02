import { DatosFormularioDto } from './datos-formulario.dto';
import { Type } from 'class-transformer';
import { ValidateNested } from 'class-validator';

export class UpdateFormularioDto {
  @ValidateNested()
  @Type(() => DatosFormularioDto)
  datosFormulario: DatosFormularioDto;
}