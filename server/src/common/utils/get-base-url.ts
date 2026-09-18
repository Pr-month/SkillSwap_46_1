import { Request } from 'express';

export const getBaseUrl = (
  allowedOrigins: string[],
  request?: Request,
): string => {
  if (!request) {
    return allowedOrigins[0];
  }

  const origin = request.get('origin');

  if (origin && allowedOrigins.includes(origin)) {
    return origin;
  }

  const referer = request.get('referer');
  if (referer) {
    try {
      const refererOrigin = new URL(referer).origin;
      if (allowedOrigins.includes(refererOrigin)) {
        return refererOrigin;
      }
    } catch {
      // ignore invalid referer
    }
  }

  const protocol = request.protocol;
  const host = request.get('host');
  if (host && allowedOrigins.includes(`${protocol}://${host}`)) {
    return `${protocol}://${host}`;
  }

  return allowedOrigins[0] || 'http://localhost:5173';
};
