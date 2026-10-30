import {
  ConflictException,
  Injectable,
  NotFoundException,
  Inject, 
  forwardRef,
} from '@nestjs/common';
import { randomUUID } from 'node:crypto';
import { CreateFilmDto } from './dto/create-film.dto.js';
import { UpdateFilmDto } from './dto/update-film.dto.js';
import { SHOWINGS_SERVICE } from '../showings/showings.constants.js';

export interface Film {
  id: string;
  title: string;
  durationMinutes: number;
  releaseYear: number;
}

@Injectable()
export class FilmsService {
  private readonly films: Film[] = [];

  constructor(
    @Inject(forwardRef(() => SHOWINGS_SERVICE))
    private readonly showingsService: {
      findByFilmId(id: string): unknown[];
    },
  ) {}

  create(dto: CreateFilmDto): Film {
    const film: Film = {
      id: randomUUID(),
      title: dto.title,
      durationMinutes: dto.durationMinutes,
      releaseYear: dto.releaseYear,
    };

    this.films.push(film);

    return film;
  }

  findAll(): Film[] {
    return [...this.films];
  }

  findOne(id: string): Film {
    const film = this.films.find((item) => item.id === id);

    if (!film) {
      throw new NotFoundException(
        `Фільм з id "${id}" не знайдено`,
      );
    }

    return film;
  }

  update(id: string, dto: UpdateFilmDto): Film {
    const film = this.findOne(id);

    if (dto.title !== undefined) {
      film.title = dto.title;
    }

    if (dto.durationMinutes !== undefined) {
      film.durationMinutes = dto.durationMinutes;
    }

    if (dto.releaseYear !== undefined) {
      film.releaseYear = dto.releaseYear;
    }

    return film;
  }

  remove(id: string) {
    const index = this.films.findIndex((film) => film.id === id);

    if (index === -1) {
      throw new NotFoundException(
        `Фільм з ID ${id} не знайдено`,
      );
    }

    const relatedShowings = this.showingsService.findByFilmId(id);

    if (relatedShowings.length > 0) {
      throw new ConflictException(
        'Неможливо видалити фільм, оскільки для нього існують сеанси',
      );
    }

    this.films.splice(index, 1);
  }

  exists(id: string): boolean {
    return this.films.some((film) => film.id === id);
  }
}