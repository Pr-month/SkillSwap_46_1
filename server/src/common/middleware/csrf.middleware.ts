import { randomBytes, timingSafeEqual } from 'crypto';
import { NextFunction, Request, Response } from 'express';

export const CSRF_COOKIE_NAME = 'csrf-token';
export const CSRF_HEADER_NAME = 'x-csrf-token';

const SAFE_METHODS = new Set<string>(['GET', 'HEAD', 'OPTIONS']);

const isSafeRequest = (req: Request): boolean =>
  SAFE_METHODS.has(req.method.toUpperCase()) ||
  process.env.NODE_ENV !== 'production';

const compareTokens = (a: string, b: string): boolean => {
  if (a.length !== b.length) {
    return false;
  }

  return timingSafeEqual(Buffer.from(a), Buffer.from(b));
};

export const getOrCreateCsrfToken = (req: Request, res: Response): string => {
  const cookies = (req.cookies ?? {}) as Record<string, string>;
  const existingToken = cookies[CSRF_COOKIE_NAME];

  if (existingToken) {
    return existingToken;
  }

  const token = randomBytes(32).toString('hex');

  res.cookie(CSRF_COOKIE_NAME, token, {
    httpOnly: false,
    sameSite: 'strict',
    secure: process.env.NODE_ENV === 'production',
  });

  return token;
};

export const csrfMiddleware = (
  req: Request,
  res: Response,
  next: NextFunction,
): void => {
  if (isSafeRequest(req)) {
    next();
    return;
  }

  const cookieToken = getOrCreateCsrfToken(req, res);
  const headerToken = req.get(CSRF_HEADER_NAME);

  if (!headerToken || !compareTokens(headerToken, cookieToken)) {
    res.status(403).json({
      statusCode: 403,
      message: 'Невалидный CSRF-токен',
    });
    return;
  }

  next();
};
