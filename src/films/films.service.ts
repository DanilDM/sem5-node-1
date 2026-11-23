import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { QueryFailedError, Repository } from 'typeorm';

import { Film } from './entities/film.entity.js';
import { Showing } from '../showings/entities/showing.entity.js';
import { CreateFilmDto } from './dto/create-film.dto.js';
import { UpdateFilmDto } from './dto/update-film.dto.js';

@Injectable()
export class FilmsService {
  constructor(
    @InjectRepository(Film)
    private readonly filmRepository: Repository<Film>,

    @InjectRepository(Showing)
    private readonly showingRepository: Repository<Showing>,
  ) {}

  async create(dto: CreateFilmDto): Promise<Film> {
    const film = this.filmRepository.create({
      title: dto.title,
      durationMinutes: dto.durationMinutes,
      releaseYear: dto.releaseYear,
    });

    return this.filmRepository.save(film);
  }

  async findAll(): Promise<Film[]> {
    return this.filmRepository.find();
  }

  async findOne(id: string): Promise<Film> {
    const film = await this.filmRepository.findOne({ where: { id } });

    if (!film) {
      throw new NotFoundException(`Фільм з id "${id}" не знайдено`);
    }

    return film;
  }

  async update(id: string, dto: UpdateFilmDto): Promise<Film> {
    const film = await this.findOne(id);

    if (dto.title !== undefined) {
      film.title = dto.title;
    }

    if (dto.durationMinutes !== undefined) {
      film.durationMinutes = dto.durationMinutes;
    }

    if (dto.releaseYear !== undefined) {
      film.releaseYear = dto.releaseYear;
    }

    return this.filmRepository.save(film);
  }

  async remove(id: string): Promise<void> {
    await this.findOne(id);

    const showingsCount = await this.showingRepository.count({
      where: { filmId: id },
    });

    if (showingsCount > 0) {
      throw new ConflictException(
        'Неможливо видалити фільм, оскільки для нього існують сеанси',
      );
    }

    try {
      await this.filmRepository.delete(id);
    } catch (error) {
      // сеанс міг з'явитися між перевіркою і видаленням
      if (
        error instanceof QueryFailedError &&
        (error as any).driverError?.code === '23503'
      ) {
        throw new ConflictException(
          'Неможливо видалити фільм, оскільки для нього існують сеанси',
        );
      }

      throw error;
    }
  }

  async exists(id: string): Promise<boolean> {
    return this.filmRepository.existsBy({ id });
  }
}