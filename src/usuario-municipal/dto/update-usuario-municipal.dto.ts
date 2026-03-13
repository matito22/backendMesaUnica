import { ApiProperty, PartialType } from '@nestjs/swagger';
import { CreateUsuarioMunicipalDto } from './create-usuario-municipal.dto';
import { IsBoolean, IsOptional } from 'class-validator';

export class UpdateUsuarioMunicipalDto extends PartialType(CreateUsuarioMunicipalDto) {

@ApiProperty({ example: true })
  @IsBoolean()
  @IsOptional()   // ✅ opcional porque es un PATCH
  activo?: boolean;
}
