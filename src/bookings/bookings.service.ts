import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { randomUUID } from 'node:crypto';

import { CreateBookingDto } from './dto/create-booking.dto.js';
import { ShowingsService } from '../showings/showings.service.js';
import { HallsService } from '../halls/halls.service.js';
import { SeatDto } from './dto/create-booking.dto.js';

export interface Booking {
  id: string;
  showingId: string;
  seats: SeatDto[];
  totalPrice: number;
}

@Injectable()
export class BookingsService {
  private bookings: Booking[] = [];

  constructor(
    private readonly showingsService: ShowingsService,
    private readonly hallsService: HallsService,
  ) {}

  create(showingId: string, dto: CreateBookingDto) {
    const showing = this.showingsService.findRaw(showingId);
    const hall = this.hallsService.findOne(showing.hallId);

    for (const seat of dto.seats) {
      if (
        seat.row > hall.rows ||
        seat.seat > hall.seatsPerRow
      ) {
        throw new BadRequestException(
          `Місце ${seat.row}-${seat.seat} не існує в цьому залі`,
        );
      }
    }

    const bookedSeats = this.bookings
      .filter((booking) => booking.showingId === showingId)
      .flatMap((booking) => booking.seats);

    const bookedSeatKeys = new Set(
      bookedSeats.map((seat) => `${seat.row}-${seat.seat}`),
    );

    const unavailableSeats = dto.seats.filter((seat) =>
      bookedSeatKeys.has(`${seat.row}-${seat.seat}`),
    );

    if (unavailableSeats.length > 0) {
      const seatsList = unavailableSeats
        .map((seat) => `${seat.row}-${seat.seat}`)
        .join(', ');

      throw new ConflictException(
        `Ці місця вже заброньовані: ${seatsList}`,
      );
    }

    // Розраховуємо загальну вартість.
    const totalPrice = showing.price * dto.seats.length;

    const booking = {
      id: randomUUID(),
      showingId,
      seats: dto.seats,
      totalPrice,
    };

    this.bookings.push(booking);

    return booking;
  }

  findAll() {
    return this.bookings;
  }

  findByShowingId(showingId: string) {
    this.showingsService.findRaw(showingId);

    return this.bookings.filter(
      (booking) => booking.showingId === showingId,
    );
  }

  getSeats(showingId: string) {
    const showing = this.showingsService.findRaw(showingId);
    const hall = this.hallsService.findOne(showing.hallId);

    const bookedSeats = this.bookings
      .filter((booking) => booking.showingId === showingId)
      .flatMap((booking) => booking.seats);

    const bookedSeatKeys = new Set(
      bookedSeats.map((seat) => `${seat.row}-${seat.seat}`),
    );

    const seats = [];

    for (let row = 1; row <= hall.rows; row++) {
      for (let seat = 1; seat <= hall.seatsPerRow; seat++) {
        seats.push({
          row,
          seat,
          isBooked: bookedSeatKeys.has(`${row}-${seat}`),
        });
      }
    }

    return seats;
  }

  remove(id: string) {
    const index = this.bookings.findIndex(
      (booking) => booking.id === id,
    );

    if (index === -1) {
      throw new NotFoundException(
        `Бронювання з ID ${id} не знайдено`,
      );
    }

    const [deletedBooking] = this.bookings.splice(index, 1);

    return deletedBooking;
  }
}