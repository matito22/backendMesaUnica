import { PartialType } from '@nestjs/swagger';
import { CreateUsuarioMunicipalDto } from './create-usuario-municipal.dto';

export class UpdateUsuarioMunicipalDto extends PartialType(CreateUsuarioMunicipalDto) {}
