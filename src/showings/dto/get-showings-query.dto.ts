import { ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsDateString,
  IsOptional,
  IsUUID,
  Matches,
} from 'class-validator';

export class GetShowingsQueryDto {
  @ApiPropertyOptional({
    example: '550e8400-e29b-41d4-a716-446655440000',
    description: 'UUID фільму',
  })
  @IsOptional()
  @IsUUID()
  filmId?: string;

  @ApiPropertyOptional({
    example: '2030-12-25',
    description: 'Дата сеансів у форматі YYYY-MM-DD',
  })
  @IsOptional()
  @IsDateString({ strict: true })
  @Matches(/^\d{4}-\d{2}-\d{2}$/, {
    message: 'Дата повинна мати формат YYYY-MM-DD',
  })
  date?: string;
}