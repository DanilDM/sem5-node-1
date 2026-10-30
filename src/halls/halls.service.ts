import {
  ConflictException,
  Injectable,
  NotFoundException,
  Inject, 
  forwardRef,
} from '@nestjs/common';
import { randomUUID } from 'node:crypto';
import { CreateHallDto } from './dto/create-hall.dto.js';
import { SHOWINGS_SERVICE } from '../showings/showings.constants.js';

export interface Hall {
  id: string;
  name: string;
  rows: number;
  seatsPerRow: number;
}

export interface Seat {
  row: number;
  seat: number;
}

export interface HallWithSeats extends Hall {
  seats: Seat[];
}

@Injectable()
export class HallsService {
  private readonly halls: Hall[] = [];

  constructor(
    @Inject(forwardRef(() => SHOWINGS_SERVICE))
    private readonly showingsService: {
      findByHallId(id: string): unknown[];
    },
  ) {}

  create(dto: CreateHallDto): Hall {
    const nameExists = this.halls.some(
      (hall) => hall.name.toLowerCase() === dto.name.trim().toLowerCase(),
    );

    if (nameExists) {
      throw new ConflictException(
        `Зал з назвою "${dto.name}" вже існує`,
      );
    }

    const hall: Hall = {
      id: randomUUID(),
      name: dto.name.trim(),
      rows: dto.rows,
      seatsPerRow: dto.seatsPerRow,
    };

    this.halls.push(hall);

    return hall;
  }

  findAll(): Hall[] {
    return [...this.halls];
  }

  findOne(id: string): HallWithSeats {
    const hall = this.halls.find((item) => item.id === id);

    if (!hall) {
      throw new NotFoundException(
        `Зал з id "${id}" не знайдено`,
      );
    }

    const seats: Seat[] = [];

    for (let row = 1; row <= hall.rows; row++) {
      for (let seat = 1; seat <= hall.seatsPerRow; seat++) {
        seats.push({ row, seat });
      }
    }

    return {
      ...hall,
      seats,
    };
  }

  remove(id: string) {
    const index = this.halls.findIndex((hall) => hall.id === id);

    if (index === -1) {
      throw new NotFoundException(
        `Зал з ID ${id} не знайдено`,
      );
    }

    const relatedShowings = this.showingsService.findByHallId(id);

    if (relatedShowings.length > 0) {
      throw new ConflictException(
        'Неможливо видалити зал, оскільки для нього існують сеанси',
      );
    }

    this.halls.splice(index, 1);
  }

  exists(id: string): boolean {
    return this.halls.some((hall) => hall.id === id);
  }
}