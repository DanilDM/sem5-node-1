import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { Showing } from './entities/showing.entity.js';
import { FilmsService } from '../films/films.service.js';
import { HallsService } from '../halls/halls.service.js';
import { CreateShowingDto } from './dto/create-showing.dto.js';
import { GetShowingsQueryDto } from './dto/get-showings-query.dto.js';

export interface ShowingResponse {
  id: string;
  filmId: string;
  hallId: string;
  startsAt: string;
  price: number;
  filmTitle: string;
  hallName: string;
}

export interface PaginatedShowings {
  items: ShowingResponse[];
  total: number;
  page: number;
  limit: number;
}

@Injectable()
export class ShowingsService {
  constructor(
    @InjectRepository(Showing)
    private readonly showingRepository: Repository<Showing>,

    private readonly filmsService: FilmsService,
    private readonly hallsService: HallsService,
  ) {}

  async create(dto: CreateShowingDto) {
    if (!(await this.filmsService.exists(dto.filmId))) {
      throw new BadRequestException(
        `Фільм з id "${dto.filmId}" не знайдено`,
      );
    }

    if (!(await this.hallsService.exists(dto.hallId))) {
      throw new BadRequestException(
        `Зал з id "${dto.hallId}" не знайдено`,
      );
    }

    const startsAt = new Date(dto.startsAt);

    if (startsAt.getTime() <= Date.now()) {
      throw new BadRequestException(
        'Дата та час початку сеансу не можуть бути в минулому',
      );
    }

    const showing = this.showingRepository.create({
      filmId: dto.filmId,
      hallId: dto.hallId,
      startsAt,
      price: dto.price,
    });

    const saved = await this.showingRepository.save(showing);

    return {
      id: saved.id,
      filmId: saved.filmId,
      hallId: saved.hallId,
      startsAt: saved.startsAt.toISOString(),
      price: saved.price,
    };
  }

  async findAll(query: GetShowingsQueryDto): Promise<PaginatedShowings> {
    const { filmId, date, page, limit, sort } = query;

    const qb = this.showingRepository
      .createQueryBuilder('showing')
      .innerJoinAndSelect('showing.film', 'film')
      .innerJoinAndSelect('showing.hall', 'hall');

    if (filmId) {
      qb.andWhere('showing.filmId = :filmId', { filmId });
    }

    if (date) {
      const startOfDay = new Date(`${date}T00:00:00.000Z`);
      const endOfDay = new Date(startOfDay.getTime() + 24 * 60 * 60 * 1000);

      qb.andWhere('showing.startsAt >= :startOfDay', { startOfDay })
        .andWhere('showing.startsAt < :endOfDay', { endOfDay });
    }

    qb.orderBy('showing.startsAt', sort === 'desc' ? 'DESC' : 'ASC')
      .addOrderBy('showing.id', 'ASC')
      .skip((page - 1) * limit)
      .take(limit);

    const [showings, total] = await qb.getManyAndCount();

    return {
      items: showings.map((showing) => this.toResponse(showing)),
      total,
      page,
      limit,
    };
  }

  async findOne(id: string): Promise<ShowingResponse> {
    const showing = await this.showingRepository.findOne({
      where: { id },
      relations: { film: true, hall: true },
    });

    if (!showing) {
      throw new NotFoundException(`Сеанс з id "${id}" не знайдено`);
    }

    return this.toResponse(showing);
  }

  async findRaw(id: string): Promise<Showing> {
    const showing = await this.showingRepository.findOne({ where: { id } });

    if (!showing) {
      throw new NotFoundException(`Сеанс з id "${id}" не знайдено`);
    }

    return showing;
  }

  async exists(id: string): Promise<boolean> {
    return this.showingRepository.existsBy({ id });
  }

  private toResponse(showing: Showing): ShowingResponse {
    return {
      id: showing.id,
      filmId: showing.filmId,
      hallId: showing.hallId,
      startsAt: showing.startsAt.toISOString(),
      price: showing.price,
      filmTitle: showing.film.title,
      hallName: showing.hall.name,
    };
  }
}