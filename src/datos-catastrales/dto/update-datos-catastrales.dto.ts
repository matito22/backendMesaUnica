import { PartialType } from '@nestjs/mapped-types';
import { CreateDatosCatastralesDto } from './create-datos-catastrales.dto';

export class UpdateDatosCatastralesDto extends PartialType(CreateDatosCatastralesDto) {}
