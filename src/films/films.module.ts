import { Module, forwardRef } from '@nestjs/common';

import { FilmsController } from './films.controller.js';
import { FilmsService } from './films.service.js';
import { ShowingsModule } from '../showings/showings.module.js';

@Module({
  imports: [forwardRef(() => ShowingsModule)],
  controllers: [FilmsController],
  providers: [FilmsService],
  exports: [FilmsService],
})
export class FilmsModule {}