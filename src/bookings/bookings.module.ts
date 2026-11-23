import { Module } from '@nestjs/common';

import { BookingsController } from './bookings.controller.js';
import { BookingsService } from './bookings.service.js';

import { ShowingsModule } from '../showings/showings.module.js';
import { HallsModule } from '../halls/halls.module.js';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Booking } from './entities/booking.entity.js';
import { BookingSeat } from './entities/booking-seat.entity.js';

@Module({
  imports: [
    TypeOrmModule.forFeature([Booking, BookingSeat]),
    ShowingsModule, 
    HallsModule,
  ],
  controllers: [BookingsController],
  providers: [BookingsService],
  exports: [BookingsService],
})
export class BookingsModule {}