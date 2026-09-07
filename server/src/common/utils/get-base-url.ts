import { Request } from 'express';

export const getBaseUrl = (request?: Request): string => {
  if (!request) {
    return 'http://localhost:4567';
  }

  const origin = request.get('origin');
  if (origin) {
    return origin;
  }

  const referer = request.get('referer');
  if (referer) {
    return new URL(referer).origin;
  }

  const protocol = request.protocol;
  const host = request.get('host');
  if (host) {
    return `${protocol}://${host}`;
  }

  return 'http://localhost:4567';
};
