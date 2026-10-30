import { ApiProperty } from '@nestjs/swagger';
import {
  IsInt,
  IsString,
  Matches,
  Min,
  MinLength,
} from 'class-validator';

export class CreateHallDto {
  @ApiProperty({
    example: 'Зал №1',
    description: 'Унікальна назва залу',
  })
  @IsString()
  @MinLength(1)
  @Matches(/\S/, {
    message: 'Назва залу не може складатися лише з пробілів',
  })
  name: string;

  @ApiProperty({
    example: 5,
    description: 'Кількість рядів',
    minimum: 1,
  })
  @IsInt()
  @Min(1)
  rows: number;

  @ApiProperty({
    example: 8,
    description: 'Кількість місць у кожному ряду',
    minimum: 1,
  })
  @IsInt()
  @Min(1)
  seatsPerRow: number;
}