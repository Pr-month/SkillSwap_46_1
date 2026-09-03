import { Controller, Get, Req, Res } from '@nestjs/common';
import { Request, Response } from 'express';

import { AppService } from './app.service';
import { getOrCreateCsrfToken } from './common/middleware/csrf.middleware';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get()
  getStatus(): string {
    return this.appService.getStatus();
  }

  @Get('health')
  getHealth(): { status: string; timestamp: string } {
    return this.appService.getHealth();
  }

  @Get('csrf-token')
  getCsrfToken(
    @Req() req: Request,
    @Res({ passthrough: true }) res: Response,
  ): { csrfToken: string } {
    return { csrfToken: getOrCreateCsrfToken(req, res) };
  }
}
