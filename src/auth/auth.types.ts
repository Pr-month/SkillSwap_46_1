export interface JwtPayload {
  sub: string; // ID пользователя
  email: string; // email
  tokenType: 'access' | 'refresh'; // чтобы отличать access от refresh
  iat?: number;
  exp?: number;
}

export type JwtPayloadInput = Pick<JwtPayload, 'sub' | 'email'>;
