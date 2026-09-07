import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';

@Injectable()
export class MockEmailConfirmedGuard implements CanActivate {
  async canActivate(_context: ExecutionContext): Promise<boolean> {
    return true;
  }
}
jest.mock('../src/mail/guards/email-confirmed.guard', () => ({
  EmailConfirmedGuard: MockEmailConfirmedGuard,
}));
