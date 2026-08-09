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
  Request as HttpRequest,
  UseGuards,
} from '@nestjs/common';
import { ApiCookieAuth, ApiOperation, ApiTags } from '@nestjs/swagger';

import { RequestWithUser } from '../auth/auth.types';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CreateRequestDto, UpdateRequestDto } from './dto';
import { RequestsService } from './requests.service';

@ApiTags('requests')
@ApiCookieAuth('accessToken')
@UseGuards(JwtAuthGuard)
@Controller('requests')
export class RequestsController {
  constructor(private readonly requestsService: RequestsService) {}

  @Post()
  @ApiOperation({ summary: 'Создать заявку на обмен' })
  create(
    @HttpRequest() request: RequestWithUser,
    @Body() dto: CreateRequestDto,
  ) {
    return this.requestsService.create(request.user.id, dto);
  }

  @Get('incoming')
  @ApiOperation({ summary: 'Получить входящие активные заявки' })
  findIncoming(@HttpRequest() request: RequestWithUser) {
    return this.requestsService.findIncoming(request.user.id);
  }

  @Get('outgoing')
  @ApiOperation({ summary: 'Получить исходящие активные заявки' })
  findOutgoing(@HttpRequest() request: RequestWithUser) {
    return this.requestsService.findOutgoing(request.user.id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Принять или отклонить входящую заявку' })
  update(
    @HttpRequest() request: RequestWithUser,
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateRequestDto,
  ) {
    return this.requestsService.update(id, request.user.id, dto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Удалить исходящую заявку' })
  remove(
    @HttpRequest() request: RequestWithUser,
    @Param('id', ParseUUIDPipe) id: string,
  ) {
    return this.requestsService.remove(id, request.user.id);
  }
}
