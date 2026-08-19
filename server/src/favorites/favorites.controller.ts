import {
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  ParseUUIDPipe,
  Post,
  Request,
  UseGuards,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';

import { RequestWithUser } from '../auth/auth.types';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { FavoriteCheckDto, FavoriteDto } from './dto/favorite-response.dto';
import { FavoritesService } from './favorites.service';

@ApiTags('favorites')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('skills')
export class FavoritesController {
  constructor(private readonly favoritesService: FavoritesService) {}

  @Post(':id/favorite')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Добавить навык в избранное' })
  @ApiResponse({ status: 201, type: FavoriteDto })
  async add(
    @Request() req: RequestWithUser,
    @Param('id', ParseUUIDPipe) id: string,
  ): Promise<FavoriteDto> {
    return await this.favoritesService.add(req.user.id, id);
  }

  @Delete(':id/favorite')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Удалить навык из избранного' })
  @ApiResponse({ status: 204 })
  async remove(
    @Request() req: RequestWithUser,
    @Param('id', ParseUUIDPipe) id: string,
  ): Promise<void> {
    await this.favoritesService.remove(req.user.id, id);
  }
}

@ApiTags('favorites')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('favorites')
export class MyFavoritesController {
  constructor(private readonly favoritesService: FavoritesService) {}

  @Get()
  @ApiOperation({
    summary: 'Получить список избранных навыков текущего пользователя',
  })
  @ApiResponse({ status: 200, type: [FavoriteDto] })
  async findAll(@Request() req: RequestWithUser): Promise<FavoriteDto[]> {
    return await this.favoritesService.findAll(req.user.id);
  }

  @Get(':id/check')
  @ApiOperation({
    summary: 'Проверить, находится ли навык в избранном у пользователя',
  })
  @ApiResponse({ status: 200, type: FavoriteCheckDto })
  async check(
    @Request() req: RequestWithUser,
    @Param('id', ParseUUIDPipe) id: string,
  ): Promise<FavoriteCheckDto> {
    return await this.favoritesService.check(req.user.id, id);
  }
}
