import { AuthService } from '@/auth/auth.service';
import { BusinessException } from '@/common/errors/business.exception';
import { exceptionCodes } from '@/common/errors/error-codes';
import { ConfigurationService } from '@/module/configuration/configuration.service';
import { UsersService } from '@/users/users.service';
import {
  Controller,
  Get,
  HttpStatus,
  Param,
  Query,
  Req,
  Res,
} from '@nestjs/common';
import { ApiOperation } from '@nestjs/swagger';
import { Request, Response } from 'express';

import { OAuthPendingService } from './oauth-pending.service';
import { OAuthResolver } from './oauth-resolver.service';
import { OAuthStateService } from './oauth-state.service';

@Controller('auth/oauth')
export class OAuthController {
  constructor(
    private readonly resolver: OAuthResolver,
    private readonly stateService: OAuthStateService,
    private readonly pendingService: OAuthPendingService,
    private readonly authService: AuthService,
    private readonly config: ConfigurationService,
    private readonly usersService: UsersService,
  ) {}

  @Get('pending/:pendingId')
  @ApiOperation({ summary: 'Профиль OAuth для предзаполнения формы' })
  async getPending(@Param('pendingId') pendingId: string) {
    const profile = await this.pendingService.peek(pendingId);

    return {
      email: profile.email,
      name: profile.name,
      avatar: profile.avatar ?? null,
      provider: profile.provider,
    };
  }

  @Get(':provider')
  async redirect(
    @Param('provider') providerName: string,
    @Req() req: Request,
    @Res() res: Response,
  ) {
    const provider = this.resolver.get(providerName);

    const state = await this.stateService.generate(
      provider.name,
      this.config.corsOrigins,
      req,
    );

    return res.redirect(provider.getAuthUrl(state));
  }

  @Get(':provider/callback')
  async callback(
    @Param('provider') providerName: string,
    @Query('code') code: string,
    @Query('state') state: string,
    @Query('error') error: string,
    @Res() res: Response,
  ) {
    const returnUrl = await this.resolveReturnUrl(state);

    if (error) {
      return res.redirect(
        `${returnUrl}/login?error=${encodeURIComponent(error)}`,
      );
    }

    if (!state) {
      throw new BusinessException(
        exceptionCodes.auth.oauthStateInvalid,
        HttpStatus.BAD_REQUEST,
      );
    }

    if (!code) {
      throw new BusinessException(
        exceptionCodes.auth.oauthFailed,
        HttpStatus.BAD_REQUEST,
      );
    }

    const { provider: expectedProvider, returnUrl: safeReturnUrl } =
      await this.stateService.consume(state);

    if (expectedProvider !== providerName) {
      throw new BusinessException(
        exceptionCodes.auth.oauthStateInvalid,
        HttpStatus.BAD_REQUEST,
      );
    }

    const provider = this.resolver.get(providerName);
    const profile = await provider.getProfile(code);

    const existing = await this.usersService.findByEmail(profile.email);
    if (existing) {
      await this.authService.login(
        { id: existing.id, email: existing.email },
        res,
      );
      return res.redirect(`${safeReturnUrl}/`);
    }

    const pendingId = await this.pendingService.create(profile);

    return res.redirect(
      `${safeReturnUrl}/registration?oauth_pending=${pendingId}`,
    );
  }

  private async resolveReturnUrl(state?: string): Promise<string> {
    const fallback = this.config.corsOrigins[0];

    if (!state) {
      return fallback;
    }

    try {
      const payload = await this.stateService.peek(state);
      return this.config.corsOrigins.includes(payload.returnUrl)
        ? payload.returnUrl
        : fallback;
    } catch {
      return fallback;
    }
  }
}
