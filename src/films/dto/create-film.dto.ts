import { ApiProperty } from '@nestjs/swagger';
import {
  IsInt,
  IsString,
  Max,
  Min,
  MinLength,
} from 'class-validator';

export class CreateFilmDto {
  @ApiProperty({
    example: 'Interstellar',
    description: 'Назва фільму',
  })
  @IsString()
  @MinLength(1)
  title: string;

  @ApiProperty({
    example: 169,
    description: 'Тривалість фільму в хвилинах',
    minimum: 1,
  })
  @IsInt()
  @Min(1)
  durationMinutes: number;

  @ApiProperty({
    example: 2014,
    description: 'Рік випуску фільму',
    minimum: 1888,
    maximum: 2100,
  })
  @IsInt()
  @Min(1888)
  @Max(2100)
  releaseYear: number;
}