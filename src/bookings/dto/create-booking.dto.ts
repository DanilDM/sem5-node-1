import { Type } from 'class-transformer';
import {
  ArrayNotEmpty,
  ArrayUnique,
  IsArray,
  IsInt,
  Min,
  ValidateNested,
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class SeatDto {
  @ApiProperty({ example: 2, description: 'Номер ряду' })
  @IsInt()
  @Min(1)
  row: number;

  @ApiProperty({ example: 5, description: 'Номер місця' })
  @IsInt()
  @Min(1)
  seat: number;
}

export class CreateBookingDto {
  @ApiProperty({
    type: [SeatDto],
    example: [
      { row: 2, seat: 5 },
      { row: 2, seat: 6 },
    ],
  })
  @IsArray()
  @ArrayNotEmpty()
  @ValidateNested({ each: true })
  @Type(() => SeatDto)
  @ArrayUnique((item: SeatDto) => `${item.row}-${item.seat}`)
  seats: SeatDto[];
}