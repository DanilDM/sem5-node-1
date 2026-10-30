import { ApiProperty } from '@nestjs/swagger';
import {
  IsInt,
  IsISO8601,
  IsString,
  Min,
  IsUUID,
} from 'class-validator';

export class CreateShowingDto {
  @ApiProperty({
    example: '550e8400-e29b-41d4-a716-446655440000',
    description: 'UUID фільму',
  })
  @IsUUID()
  filmId: string;

  @ApiProperty({
    example: '550e8400-e29b-41d4-a716-446655440001',
    description: 'UUID залу',
  })
  @IsUUID()
  hallId: string;

  @ApiProperty({
    example: '2030-12-25T18:30:00.000Z',
    description: 'Дата та час початку сеансу в ISO 8601',
  })
  @IsString()
  @IsISO8601()
  startsAt: string;

  @ApiProperty({
    example: 12500,
    description: 'Ціна одного квитка в копійках',
    minimum: 1,
  })
  @IsInt()
  @Min(1)
  price: number;
}