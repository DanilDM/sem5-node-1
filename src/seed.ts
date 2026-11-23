import AppDataSource from './database/data-source.js';

import { Film } from './films/entities/film.entity.js';
import { Hall } from './halls/entities/hall.entity.js';
import { Showing } from './showings/entities/showing.entity.js';
import { Booking } from './bookings/entities/booking.entity.js';
import { BookingSeat } from './bookings/entities/booking-seat.entity.js';

async function seed() {
  await AppDataSource.initialize();

  console.log('Database connected. Starting seed...');

  try {
    const filmRepository = AppDataSource.getRepository(Film);
    const hallRepository = AppDataSource.getRepository(Hall);
    const showingRepository = AppDataSource.getRepository(Showing);
    const bookingRepository = AppDataSource.getRepository(Booking);
    const bookingSeatRepository = AppDataSource.getRepository(BookingSeat);

    // 1. Create films

    const filmsData = [
      {
        title: 'Inception',
        durationMinutes: 148,
        releaseYear: 2010,
      },
      {
        title: 'Interstellar',
        durationMinutes: 169,
        releaseYear: 2014,
      },
    ];

    const films: Film[] = [];

    for (const filmData of filmsData) {
      let film = await filmRepository.findOne({
        where: {
          title: filmData.title,
          releaseYear: filmData.releaseYear,
        },
      });

      if (!film) {
        film = await filmRepository.save(
          filmRepository.create(filmData),
        );

        console.log(`Created film: ${film.title}`);
      }

      films.push(film);
    }

    // 2. Create halls

    const hallsData = [
      {
        name: 'Hall 1',
        rows: 10,
        seatsPerRow: 12,
      },
      {
        name: 'Hall 2',
        rows: 8,
        seatsPerRow: 10,
      },
    ];

    const halls: Hall[] = [];

    for (const hallData of hallsData) {
      let hall = await hallRepository.findOne({
        where: { name: hallData.name },
      });

      if (!hall) {
        hall = await hallRepository.save(
          hallRepository.create(hallData),
        );

        console.log(`Created hall: ${hall.name}`);
      }

      halls.push(hall);
    }

    // 3. Create showings

    const showingsData = [
      {
        film: films[0],
        hall: halls[0],
        startsAt: new Date('2026-12-01T15:00:00.000Z'),
        price: 15000,
      },
      {
        film: films[0],
        hall: halls[1],
        startsAt: new Date('2026-12-03T18:00:00.000Z'),
        price: 18000,
      },
      {
        film: films[1],
        hall: halls[0],
        startsAt: new Date('2026-12-05T16:00:00.000Z'),
        price: 20000,
      },
      {
        film: films[1],
        hall: halls[1],
        startsAt: new Date('2026-12-07T19:00:00.000Z'),
        price: 18000,
      },
    ];

    const showings: Showing[] = [];

    for (const showingData of showingsData) {
      let showing = await showingRepository.findOne({
        where: {
          filmId: showingData.film.id,
          hallId: showingData.hall.id,
          startsAt: showingData.startsAt,
        },
      });

      if (!showing) {
        showing = await showingRepository.save(
          showingRepository.create({
            filmId: showingData.film.id,
            hallId: showingData.hall.id,
            startsAt: showingData.startsAt,
            price: showingData.price,
          }),
        );

        console.log(
          `Created showing: ${showing.id}`,
        );
      }

      showings.push(showing);
    }

    // 4. Create one booking with two seats

    const showing = showings[0];

    const existingBookings = await bookingRepository.find({
      where: { showingId: showing.id },
      relations: { seats: true },
    });

    // Check whether our seed booking already exists.
    const seedSeats = [
      { row: 1, seat: 1 },
      { row: 1, seat: 2 },
    ];

    const seedSeatKeys = seedSeats
      .map((seat) => `${seat.row}-${seat.seat}`)
      .sort();

    const bookingExists = existingBookings.some((booking) => {
      const existingSeatKeys = booking.seats
        .map((seat) => `${seat.row}-${seat.seat}`)
        .sort();

      return (
        existingSeatKeys.length === seedSeatKeys.length &&
        existingSeatKeys.every(
          (key, index) => key === seedSeatKeys[index],
        )
      );
    });

    if (!bookingExists) {
      // Find two available seats.
      const bookedSeats = await bookingSeatRepository.find({
        where: { showingId: showing.id },
      });

      const bookedSeatKeys = new Set(
        bookedSeats.map(
          (seat) => `${seat.row}-${seat.seat}`,
        ),
      );

      const availableSeats: { row: number; seat: number }[] = [];

      const hall = halls[0];

      for (let row = 1; row <= hall.rows; row++) {
        for (
          let seat = 1;
          seat <= hall.seatsPerRow;
          seat++
        ) {
          const key = `${row}-${seat}`;

          if (!bookedSeatKeys.has(key)) {
            availableSeats.push({ row, seat });
          }

          if (availableSeats.length === 2) {
            break;
          }
        }

        if (availableSeats.length === 2) {
          break;
        }
      }

      if (availableSeats.length < 2) {
        throw new Error('Not enough available seats for seed booking');
      }

      await AppDataSource.transaction(async (manager) => {
        const transactionBookingRepository =
          manager.getRepository(Booking);

        const transactionSeatRepository =
          manager.getRepository(BookingSeat);

        const booking = await transactionBookingRepository.save(
          transactionBookingRepository.create({
            showingId: showing.id,
            totalPrice: showing.price * availableSeats.length,
          }),
        );

        const seats = availableSeats.map((seat) =>
          transactionSeatRepository.create({
            bookingId: booking.id,
            showingId: showing.id,
            row: seat.row,
            seat: seat.seat,
          }),
        );

        await transactionSeatRepository.save(seats);
      });

      console.log('Created seed booking with two seats');
    } else {
      console.log('Seed booking already exists');
    }

    console.log('Seed completed successfully!');
  } finally {
    await AppDataSource.destroy();
  }
}

seed().catch((error) => {
  console.error('Seed failed:', error);
  process.exitCode = 1;
});
