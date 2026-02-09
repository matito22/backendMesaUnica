import { PartialType } from '@nestjs/swagger';
import { CreateContribuyenteDto } from './create-contribuyente.dto';

export class UpdateContribuyenteDto extends PartialType(CreateContribuyenteDto) {}
