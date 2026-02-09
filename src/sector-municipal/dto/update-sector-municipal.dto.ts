import { PartialType } from '@nestjs/swagger';
import { CreateSectorMunicipalDto } from './create-sector-municipal.dto';

export class UpdateSectorMunicipalDto extends PartialType(CreateSectorMunicipalDto) {}
