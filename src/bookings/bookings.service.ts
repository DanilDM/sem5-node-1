import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';

import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource, QueryFailedError } from 'typeorm';

import { Booking } from './entities/booking.entity.js';
import { BookingSeat } from './entities/booking-seat.entity.js';

import { CreateBookingDto } from './dto/create-booking.dto.js';
import { ShowingsService } from '../showings/showings.service.js';
import { HallsService } from '../halls/halls.service.js';

@Injectable()
export class BookingsService {
  constructor(
    @InjectRepository(Booking)
    private readonly bookingRepository: Repository<Booking>,

    @InjectRepository(BookingSeat)
    private readonly bookingSeatRepository: Repository<BookingSeat>,

    private readonly dataSource: DataSource,

    private readonly showingsService: ShowingsService,
    private readonly hallsService: HallsService,
  ) {}

  async create(showingId: string, dto: CreateBookingDto) {
    const showing = await this.showingsService.findRaw(showingId);
    const hall = await this.hallsService.findOne(showing.hallId);

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

    const totalPrice = showing.price * dto.seats.length;

    try {
      return await this.dataSource.transaction(
        async (manager: { getRepository: (arg0: typeof Booking | typeof BookingSeat) => any; }) => {
          const bookingRepository =
            manager.getRepository(Booking);

          const seatRepository =
            manager.getRepository(BookingSeat);

          const booking = bookingRepository.create({
            showingId,
            totalPrice,
          });

          const savedBooking =
            await bookingRepository.save(booking);

          const seats = dto.seats.map((seat) =>
            seatRepository.create({
              bookingId: savedBooking.id,
              showingId,
              row: seat.row,
              seat: seat.seat,
            }),
          );

          await seatRepository.save(seats);

          return {
            id: savedBooking.id,
            showingId,
            seats: dto.seats,
            totalPrice,
          };
        },
      );
    } catch (error) {
      if (
        error instanceof QueryFailedError &&
        (error as any).driverError?.code === '23505'
      ) {
        throw new ConflictException(
          'Одне або декілька місць уже заброньовані',
        );
      }

      throw error;
    }
  }

  async findAll() {
    return this.bookingRepository.find({
      relations: {
        seats: true,
      },
    });
  }

  async findByShowingId(showingId: string) {
    await this.showingsService.findRaw(showingId);

    return this.bookingRepository.find({
      where: { showingId },
      relations: {
        seats: true,
      },
    });
  }

  async getSeats(showingId: string) {
    const showing = await this.showingsService.findRaw(showingId);
    const hall = await this.hallsService.findOne(showing.hallId);

    const bookedSeats = await this.bookingSeatRepository.find({
      where: { showingId },
    });

    const bookedSeatKeys = new Set(
      bookedSeats.map(
        (seat: { row: any; seat: any; }) => `${seat.row}-${seat.seat}`,
      ),
    );

    const seats = [];

    for (let row = 1; row <= hall.rows; row++) {
      for (
        let seat = 1;
        seat <= hall.seatsPerRow;
        seat++
      ) {
        seats.push({
          row,
          seat,
          isBooked: bookedSeatKeys.has(`${row}-${seat}`),
        });
      }
    }

    return seats;
  }

  async remove(id: string) {
    const booking = await this.bookingRepository.findOne({
      where: { id },
      relations: {
        seats: true,
      },
    });

    if (!booking) {
      throw new NotFoundException(
        `Бронювання з ID ${id} не знайдено`,
      );
    }

    await this.bookingRepository.remove(booking);

    return ;
  }
}
