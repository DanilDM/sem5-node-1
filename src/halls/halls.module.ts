import { Module, forwardRef } from '@nestjs/common';

import { HallsController } from './halls.controller.js';
import { HallsService } from './halls.service.js';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Hall } from './entities/hall.entity.js';
import { Showing } from '../showings/entities/showing.entity.js';

@Module({
  imports: [TypeOrmModule.forFeature([Hall, Showing])],
  controllers: [HallsController],
  providers: [HallsService],
  exports: [HallsService],
})
export class HallsModule {}