import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  OneToMany,
  JoinColumn,
  CreateDateColumn,
  type Relation,
} from 'typeorm';

import { Showing } from '../../showings/entities/showing.entity.js';
import { BookingSeat } from './booking-seat.entity.js';

@Entity('bookings')
export class Booking {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'showing_id', type: 'uuid' })
  showingId: string;

  @ManyToOne(() => Showing, (showing) => showing.bookings, {
    nullable: false,
  })
  @JoinColumn({ name: 'showing_id' })
  showing: Relation<Showing>;

  @Column({ name: 'total_price', type: 'integer' })
  totalPrice: number;

  @CreateDateColumn({
    name: 'created_at',
    type: 'timestamptz',
  })
  createdAt: Date;

  @OneToMany(() => BookingSeat, (seat) => seat.booking, {
    cascade: true,
  })
  seats: Relation<BookingSeat[]>;
}
