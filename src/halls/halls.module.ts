import { Module, forwardRef } from '@nestjs/common';

import { HallsController } from './halls.controller.js';
import { HallsService } from './halls.service.js';
import { ShowingsModule } from '../showings/showings.module.js';

@Module({
  imports: [forwardRef(() => ShowingsModule)],
  controllers: [HallsController],
  providers: [HallsService],
  exports: [HallsService],
})
export class HallsModule {}