import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
  Index,
  type Relation,
} from 'typeorm';

import { Booking } from './booking.entity.js';
import { Showing } from '../../showings/entities/showing.entity.js';

@Entity('booking_seats')
@Index(
  'IDX_booking_seats_showing_row_seat',
  ['showingId', 'row', 'seat'],
  { unique: true },
)
export class BookingSeat {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'booking_id', type: 'uuid' })
  bookingId: string;

  @ManyToOne(() => Booking, (booking) => booking.seats, {
    nullable: false,
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'booking_id' })
  booking: Relation<Booking>;

  @Column({ name: 'showing_id', type: 'uuid' })
  showingId: string;

  @ManyToOne(() => Showing, {
    nullable: false,
  })
  @JoinColumn({ name: 'showing_id' })
  showing: Relation<Showing>;

  @Column({ type: 'integer' })
  row: number;

  @Column({ type: 'integer' })
  seat: number;
}
