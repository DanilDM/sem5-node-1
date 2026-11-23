import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { QueryFailedError, Repository } from 'typeorm';

import { Hall } from './entities/hall.entity.js';
import { Showing } from '../showings/entities/showing.entity.js';
import { CreateHallDto } from './dto/create-hall.dto.js';

export interface Seat {
  row: number;
  seat: number;
}

export interface HallWithSeats extends Hall {
  seats: Seat[];
}

@Injectable()
export class HallsService {
  constructor(
    @InjectRepository(Hall)
    private readonly hallRepository: Repository<Hall>,

    @InjectRepository(Showing)
    private readonly showingRepository: Repository<Showing>,
  ) {}

  async create(dto: CreateHallDto): Promise<Hall> {
    const name = dto.name.trim();

    const nameExists = await this.hallRepository
      .createQueryBuilder('hall')
      .where('LOWER(hall.name) = :name', { name: name.toLowerCase() })
      .getExists();

    if (nameExists) {
      throw new ConflictException(`Зал з назвою "${dto.name}" вже існує`);
    }

    const hall = this.hallRepository.create({
      name,
      rows: dto.rows,
      seatsPerRow: dto.seatsPerRow,
    });

    return this.hallRepository.save(hall);
  }

  async findAll(): Promise<Hall[]> {
    return this.hallRepository.find();
  }

  async findOne(id: string): Promise<HallWithSeats> {
    const hall = await this.hallRepository.findOne({ where: { id } });

    if (!hall) {
      throw new NotFoundException(`Зал з id "${id}" не знайдено`);
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

  async remove(id: string): Promise<void> {
    const hall = await this.hallRepository.findOne({ where: { id } });

    if (!hall) {
      throw new NotFoundException(`Зал з ID ${id} не знайдено`);
    }

    const showingsCount = await this.showingRepository.count({
      where: { hallId: id },
    });

    if (showingsCount > 0) {
      throw new ConflictException(
        'Неможливо видалити зал, оскільки для нього існують сеанси',
      );
    }

    try {
      await this.hallRepository.delete(id);
    } catch (error) {
      if (
        error instanceof QueryFailedError &&
        (error as any).driverError?.code === '23503'
      ) {
        throw new ConflictException(
          'Неможливо видалити зал, оскільки для нього існують сеанси',
        );
      }

      throw error;
    }
  }

  async exists(id: string): Promise<boolean> {
    return this.hallRepository.existsBy({ id });
  }
}