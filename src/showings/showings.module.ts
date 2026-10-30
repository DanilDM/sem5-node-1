import { Module, forwardRef } from '@nestjs/common';

import { ShowingsController } from './showings.controller.js';
import { ShowingsService } from './showings.service.js';

import { FilmsModule } from '../films/films.module.js';
import { HallsModule } from '../halls/halls.module.js';

import { SHOWINGS_SERVICE } from './showings.constants.js';

@Module({
  imports: [
    forwardRef(() => FilmsModule),
    forwardRef(() => HallsModule),
  ],
  controllers: [ShowingsController],
  providers: [
    ShowingsService,
    {
      provide: SHOWINGS_SERVICE,
      useExisting: ShowingsService,
    },
  ],
  exports: [ShowingsService, SHOWINGS_SERVICE],
})
export class ShowingsModule {}