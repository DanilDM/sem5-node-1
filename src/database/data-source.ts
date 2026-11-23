import 'dotenv/config';

import { DataSource } from 'typeorm';

import { validateEnvironment } from '../config/env.validation.js';

import { Film } from '../films/entities/film.entity.js';
import { Hall } from '../halls/entities/hall.entity.js';
import { Showing } from '../showings/entities/showing.entity.js';
import { Booking } from '../bookings/entities/booking.entity.js';
import { BookingSeat } from '../bookings/entities/booking-seat.entity.js';

const env = validateEnvironment(process.env);

const AppDataSource = new DataSource({
  type: 'postgres',

  host: env.DB_HOST,
  port: env.DB_PORT,

  username: env.DB_USERNAME,
  password: env.DB_PASSWORD,
  database: env.DB_NAME,

  entities: [
    Film,
    Hall,
    Showing,
    Booking,
    BookingSeat,
  ],

  migrations: ['src/database/migrations/*.ts'],

  migrationsTableName: 'migrations',

  synchronize: false,

  uuidExtension: 'pgcrypto',

  logging: env.NODE_ENV === 'development',
});

export default AppDataSource;
