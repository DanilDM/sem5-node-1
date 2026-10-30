import {
  Body,
  Controller,
  Get,
  Param,
  ParseUUIDPipe,
  Post,
  Query,
} from '@nestjs/common';

import {
  ApiBadRequestResponse,
  ApiCreatedResponse,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiOperation,
  ApiParam,
  ApiQuery,
  ApiTags,
} from '@nestjs/swagger';

import { ShowingsService } from './showings.service.js';
import { CreateShowingDto } from './dto/create-showing.dto.js';
import { GetShowingsQueryDto } from './dto/get-showings-query.dto.js';

@ApiTags('Showings')
@Controller('showings')
export class ShowingsController {
  constructor(
    private readonly showingsService: ShowingsService,
  ) {}

  @Post()
  @ApiOperation({ summary: 'Створити сеанс' })
  @ApiCreatedResponse({ description: 'Сеанс створено' })
  @ApiBadRequestResponse({
    description: 'Некоректні дані, фільм або зал не знайдено',
  })
  create(@Body() dto: CreateShowingDto) {
    return this.showingsService.create(dto);
  }

  @Get()
  @ApiOperation({ summary: 'Отримати розклад сеансів' })
  @ApiQuery({
    name: 'filmId',
    required: false,
    description: 'Фільтр за UUID фільму',
  })
  @ApiQuery({
    name: 'date',
    required: false,
    example: '2030-12-25',
    description: 'Фільтр за датою YYYY-MM-DD',
  })
  @ApiOkResponse({
    description: 'Список сеансів із назвами фільмів і залів',
  })
  @ApiBadRequestResponse({
    description: 'Некоректний формат query-параметрів',
  })
  findAll(@Query() query: GetShowingsQueryDto) {
    return this.showingsService.findAll(
      query.filmId,
      query.date,
    );
  }

  @Get(':id')
  @ApiOperation({ summary: 'Отримати сеанс за ID' })
  @ApiParam({ name: 'id', description: 'UUID сеансу' })
  @ApiOkResponse({ description: 'Сеанс знайдено' })
  @ApiBadRequestResponse({ description: 'Некоректний UUID' })
  @ApiNotFoundResponse({ description: 'Сеанс не знайдено' })
  findOne(@Param('id', new ParseUUIDPipe()) id: string) {
    return this.showingsService.findOne(id);
  }
}