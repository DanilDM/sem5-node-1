import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  ParseUUIDPipe,
  Patch,
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
import { FilmsService } from './films.service.js';
import { CreateFilmDto } from './dto/create-film.dto.js';
import { UpdateFilmDto } from './dto/update-film.dto.js';

@ApiTags('Films')
@Controller('films')
export class FilmsController {
  constructor(private readonly filmsService: FilmsService) {}

  @Post()
  @ApiOperation({ summary: 'Створити фільм' })
  @ApiCreatedResponse({ description: 'Фільм успішно створено' })
  @ApiBadRequestResponse({ description: 'Некоректні дані фільму' })
  create(@Body() dto: CreateFilmDto) {
    return this.filmsService.create(dto);
  }

  @Get()
  @ApiOperation({ summary: 'Отримати всі фільми' })
  @ApiOkResponse({ description: 'Масив фільмів' })
  findAll() {
    return this.filmsService.findAll();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Отримати фільм за ID' })
  @ApiParam({ name: 'id', description: 'UUID фільму' })
  @ApiOkResponse({ description: 'Фільм знайдено' })
  @ApiBadRequestResponse({ description: 'Некоректний UUID' })
  @ApiNotFoundResponse({ description: 'Фільм не знайдено' })
  findOne(@Param('id', new ParseUUIDPipe()) id: string) {
    return this.filmsService.findOne(id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Оновити фільм' })
  @ApiParam({ name: 'id', description: 'UUID фільму' })
  @ApiOkResponse({ description: 'Фільм оновлено' })
  @ApiBadRequestResponse({ description: 'Некоректні дані або UUID' })
  @ApiNotFoundResponse({ description: 'Фільм не знайдено' })
  update(
    @Param('id', new ParseUUIDPipe()) id: string,
    @Body() dto: UpdateFilmDto,
  ) {
    return this.filmsService.update(id, dto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Видалити фільм' })
  @ApiParam({ name: 'id', description: 'UUID фільму' })
  @ApiNoContentResponse({ description: 'Фільм видалено' })
  @ApiBadRequestResponse({ description: 'Некоректний UUID' })
  @ApiNotFoundResponse({ description: 'Фільм не знайдено' })
  @ApiConflictResponse({
    description: 'Неможливо видалити фільм, на який є посилання',
  })
  remove(@Param('id', new ParseUUIDPipe()) id: string): void {
    this.filmsService.remove(id);
  }
}