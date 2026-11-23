import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  OneToMany,
  JoinColumn,
  type Relation,
} from 'typeorm';

import { Film } from '../../films/entities/film.entity.js';
import { Hall } from '../../halls/entities/hall.entity.js';
import { Booking } from '../../bookings/entities/booking.entity.js';
import { BookingSeat } from '../../bookings/entities/booking-seat.entity.js';

@Entity('showings')
export class Showing {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'film_id', type: 'uuid' })
  filmId: string;

  @ManyToOne(() => Film, (film) => film.showings, {
    nullable: false,
    onDelete: 'RESTRICT',
  })
  @JoinColumn({ name: 'film_id' })
  film: Relation<Film>;

  @Column({ name: 'hall_id', type: 'uuid' })
  hallId: string;

  @ManyToOne(() => Hall, (hall) => hall.showings, {
    nullable: false,
    onDelete: 'RESTRICT',
  })
  @JoinColumn({ name: 'hall_id' })
  hall: Hall;

  @Column({ name: 'starts_at', type: 'timestamptz' })
  startsAt: Date;

  @Column({ type: 'integer' })
  price: number;

  @OneToMany(() => Booking, (booking) => booking.showing)
  bookings: Booking[];

  @OneToMany(() => BookingSeat, (seat) => seat.showing)
  bookingSeats: BookingSeat[];
}
