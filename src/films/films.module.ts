import { Module, forwardRef } from '@nestjs/common';

import { FilmsController } from './films.controller.js';
import { FilmsService } from './films.service.js';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Film } from './entities/film.entity.js';
import { Showing } from '../showings/entities/showing.entity.js';

@Module({
  imports: [TypeOrmModule.forFeature([Film, Showing])],
  controllers: [FilmsController],
  providers: [FilmsService],
  exports: [FilmsService],
})
export class FilmsModule {}