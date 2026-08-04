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

  @Get('favorites')
  @ApiOperation({
    summary: 'Получить список избранных навыков текущего пользователя',
  })
  @ApiResponse({ status: 200, type: [FavoriteDto] })
  findAll(@Request() req: RequestWithUser): Promise<FavoriteDto[]> {
    return this.favoritesService.findAll(req.user.id);
  }

  @Get('favorites/:id/check')
  @ApiOperation({
    summary: 'Проверить, находится ли навык в избранном у пользователя',
  })
  @ApiResponse({ status: 200, type: FavoriteCheckDto })
  check(
    @Request() req: RequestWithUser,
    @Param('id', ParseUUIDPipe) id: string,
  ): Promise<FavoriteCheckDto> {
    return this.favoritesService.check(req.user.id, id);
  }

  @Post(':id/favorite')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Добавить навык в избранное' })
  @ApiResponse({ status: 201, type: FavoriteDto })
  add(
    @Request() req: RequestWithUser,
    @Param('id', ParseUUIDPipe) id: string,
  ): Promise<FavoriteDto> {
    return this.favoritesService.add(req.user.id, id);
  }

  @Delete(':id/favorite')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Удалить навык из избранного' })
  @ApiResponse({ status: 204 })
  remove(
    @Request() req: RequestWithUser,
    @Param('id', ParseUUIDPipe) id: string,
  ): Promise<void> {
    return this.favoritesService.remove(req.user.id, id);
  }
}
