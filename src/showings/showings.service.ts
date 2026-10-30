import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { randomUUID } from 'node:crypto';

import { FilmsService } from '../films/films.service.js';
import { HallsService } from '../halls/halls.service.js';
import { CreateShowingDto } from './dto/create-showing.dto.js';

export interface Showing {
  id: string;
  filmId: string;
  hallId: string;
  startsAt: string;
  price: number;
}

export interface ShowingResponse extends Showing {
  filmTitle: string;
  hallName: string;
}

@Injectable()
export class ShowingsService {
  private readonly showings: Showing[] = [];

  constructor(
    private readonly filmsService: FilmsService,
    private readonly hallsService: HallsService,
  ) {}

  create(dto: CreateShowingDto): Showing {
    if (!this.filmsService.exists(dto.filmId)) {
      throw new BadRequestException(
        `Фільм з id "${dto.filmId}" не знайдено`,
      );
    }

    if (!this.hallsService.exists(dto.hallId)) {
      throw new BadRequestException(
        `Зал з id "${dto.hallId}" не знайдено`,
      );
    }

    const startsAtDate = new Date(dto.startsAt);

    if (startsAtDate.getTime() <= Date.now()) {
      throw new BadRequestException(
        'Дата та час початку сеансу не можуть бути в минулому',
      );
    }

    const showing: Showing = {
      id: randomUUID(),
      filmId: dto.filmId,
      hallId: dto.hallId,
      startsAt: dto.startsAt,
      price: dto.price,
    };

    this.showings.push(showing);

    return showing;
  }

  findAll(
    filmId?: string,
    date?: string,
  ): ShowingResponse[] {
    let result = [...this.showings];

    if (filmId) {
      result = result.filter(
        (showing) => showing.filmId === filmId,
      );
    }

    if (date) {
      const startOfDay = new Date(`${date}T00:00:00.000Z`).getTime();
      const endOfDay = startOfDay + 24 * 60 * 60 * 1000;

      result = result.filter((showing) => {
        const time = new Date(showing.startsAt).getTime();

        return time >= startOfDay && time < endOfDay;
      });
    }

    result.sort((a, b) => {
      const timeDifference =
        new Date(a.startsAt).getTime() -
        new Date(b.startsAt).getTime();

      return timeDifference || a.id.localeCompare(b.id);
    });

    return result.map((showing) => this.toResponse(showing));
  }

  findOne(id: string): ShowingResponse {
    const showing = this.showings.find(
      (item) => item.id === id,
    );

    if (!showing) {
      throw new NotFoundException(
        `Сеанс з id "${id}" не знайдено`,
      );
    }

    return this.toResponse(showing);
  }

  findRaw(id: string): Showing {
    const showing = this.showings.find(
      (item) => item.id === id,
    );

    if (!showing) {
      throw new NotFoundException(
        `Сеанс з id "${id}" не знайдено`,
      );
    }

    return showing;
  }

  exists(id: string): boolean {
    return this.showings.some(
      (showing) => showing.id === id,
    );
  }

  findByFilmId(filmId: string): Showing[] {
    return this.showings.filter(
      (showing) => showing.filmId === filmId,
    );
  }

  findByHallId(hallId: string): Showing[] {
    return this.showings.filter(
      (showing) => showing.hallId === hallId,
    );
  }

  private toResponse(showing: Showing): ShowingResponse {
    const film = this.filmsService.findOne(showing.filmId);
    const hall = this.hallsService.findOne(showing.hallId);

    return {
      ...showing,
      filmTitle: film.title,
      hallName: hall.name,
    };
  }
}