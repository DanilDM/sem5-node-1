import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  ParseUUIDPipe,
  Post,
} from '@nestjs/common';
import {
  ApiBadRequestResponse,
  ApiConflictResponse,
  ApiCreatedResponse,
  ApiNoContentResponse,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiOperation,
  ApiParam,
  ApiTags,
} from '@nestjs/swagger';
import { HallsService } from './halls.service.js';
import { CreateHallDto } from './dto/create-hall.dto.js';

@ApiTags('Halls')
@Controller('halls')
export class HallsController {
  constructor(private readonly hallsService: HallsService) {}

  @Post()
  @ApiOperation({ summary: 'Створити зал' })
  @ApiCreatedResponse({ description: 'Зал успішно створено' })
  @ApiBadRequestResponse({ description: 'Некоректні дані залу' })
  @ApiConflictResponse({ description: 'Зал з такою назвою вже існує' })
  create(@Body() dto: CreateHallDto) {
    return this.hallsService.create(dto);
  }

  @Get()
  @ApiOperation({ summary: 'Отримати всі зали' })
  @ApiOkResponse({ description: 'Масив залів' })
  findAll() {
    return this.hallsService.findAll();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Отримати зал зі схемою місць' })
  @ApiParam({ name: 'id', description: 'UUID залу' })
  @ApiOkResponse({ description: 'Зал зі списком місць' })
  @ApiBadRequestResponse({ description: 'Некоректний UUID' })
  @ApiNotFoundResponse({ description: 'Зал не знайдено' })
  findOne(@Param('id', new ParseUUIDPipe()) id: string) {
    return this.hallsService.findOne(id);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Видалити зал' })
  @ApiParam({ name: 'id', description: 'UUID залу' })
  @ApiNoContentResponse({ description: 'Зал видалено' })
  @ApiBadRequestResponse({ description: 'Некоректний UUID' })
  @ApiNotFoundResponse({ description: 'Зал не знайдено' })
  @ApiConflictResponse({
    description: 'Неможливо видалити зал, який використовується в сеансах',
  })
  remove(@Param('id', new ParseUUIDPipe()) id: string): void {
    this.hallsService.remove(id);
  }
}