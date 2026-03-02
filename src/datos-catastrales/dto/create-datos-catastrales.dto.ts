import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsDecimal, IsNumber, IsOptional, IsString } from 'class-validator';

export class CreateDatosCatastralesDto {
  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  circunscripcion?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  seccion?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  fraccion?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  chacra?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  quinta?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  manzana?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  parcela?: string;

  @ApiPropertyOptional({ description: 'UH/UF' })
  @IsOptional()
  @IsString()
  uhUf?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  partida?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsNumber()
  supTerreno?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsNumber()
  supLocal?: number;
}
