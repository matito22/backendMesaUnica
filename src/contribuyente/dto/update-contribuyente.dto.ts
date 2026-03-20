import { ApiProperty, PartialType } from '@nestjs/swagger';
import { CreateContribuyenteDto } from './create-contribuyente.dto';
import { IsBoolean, IsOptional } from 'class-validator';

export class UpdateContribuyenteDto extends PartialType(CreateContribuyenteDto) {

    @ApiProperty({ example: true })
    @IsBoolean()
    @IsOptional()   // ✅ opcional porque es un PATCH
    activo?: boolean;
}
