import { Request } from 'express';
export interface JwtPayload {
    sub: string;
    email: string;
    tokenType: 'access' | 'refresh';
    iat?: number;
    exp?: number;
}
export type JwtPayloadInput = Pick<JwtPayload, 'sub' | 'email'>;
export interface RequestWithUser extends Request {
    user: AuthenticatedUser;
}
export interface AuthenticatedUser {
    id: string;
    email: string;
    [key: string]: unknown;
}
