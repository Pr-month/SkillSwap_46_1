import { TokenType } from '@/common/enums/token-type.enum';
import { Request } from 'express';

export interface JwtPayload {
  sub: string; // ID пользователя
  email: string; // email
  tokenType: TokenType.ACCESS | TokenType.REFRESH; // чтобы отличать access от refresh
  iat?: number;
  exp?: number;
}

export type JwtPayloadInput = Pick<JwtPayload, 'sub' | 'email'>;

export interface AuthenticatedUser {
  id: string;
  email: string;
  [key: string]: unknown;
}

export interface RefreshAuthenticatedUser extends AuthenticatedUser {
  refreshToken: string;
}

export interface RequestWithUser extends Request {
  user: AuthenticatedUser;
}

export interface RequestWithRefreshUser extends Request {
  user: RefreshAuthenticatedUser;
}
