import {
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  ParseUUIDPipe,
  Post,
  Body,
} from '@nestjs/common';

import {
  ApiOperation,
  ApiParam,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';

import { BookingsService } from './bookings.service.js';
import { CreateBookingDto } from './dto/create-booking.dto.js';

@ApiTags('Bookings')
@Controller()
export class BookingsController {
  constructor(private readonly bookingsService: BookingsService) {}

  @Get('bookings')
  @ApiOperation({ summary: 'Отримати всі бронювання' })
  @ApiResponse({ status: 200, description: 'Список бронювань' })
  findAll() {
    return this.bookingsService.findAll();
  }

  @Post('showings/:id/bookings')
  @ApiOperation({ summary: 'Створити бронювання на сеанс' })
  @ApiParam({ name: 'id', description: 'UUID сеансу' })
  @ApiResponse({ status: 201, description: 'Бронювання створено' })
  @ApiResponse({ status: 400, description: 'Некоректні дані або місце не існує' })
  @ApiResponse({ status: 404, description: 'Сеанс не знайдено' })
  @ApiResponse({ status: 409, description: 'Місце вже заброньоване' })
  create(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: CreateBookingDto,
  ) {
    return this.bookingsService.create(id, dto);
  }

  @Get('showings/:id/bookings')
  @ApiOperation({ summary: 'Отримати бронювання конкретного сеансу' })
  @ApiParam({ name: 'id', description: 'UUID сеансу' })
  @ApiResponse({ status: 200, description: 'Список бронювань сеансу' })
  @ApiResponse({ status: 404, description: 'Сеанс не знайдено' })
  findByShowingId(
    @Param('id', ParseUUIDPipe) id: string,
  ) {
    return this.bookingsService.findByShowingId(id);
  }

  @Delete('bookings/:id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Скасувати бронювання' })
  @ApiParam({ name: 'id', description: 'UUID бронювання' })
  @ApiResponse({ status: 204, description: 'Бронювання скасовано' })
  @ApiResponse({ status: 404, description: 'Бронювання не знайдено' })
  remove(@Param('id', ParseUUIDPipe) id: string) {
    this.bookingsService.remove(id);
  }

  @Get('showings/:id/seats')
  @ApiOperation({ summary: 'Отримати місця та їхній статус на сеансі' })
  @ApiParam({ name: 'id', description: 'UUID сеансу' })
  @ApiResponse({ status: 200, description: 'Місця із зазначенням доступності' })
  @ApiResponse({ status: 404, description: 'Сеанс не знайдено' })
  getSeats(@Param('id', ParseUUIDPipe) id: string) {
    return this.bookingsService.getSeats(id);
  }
}