import { ExecutionContext } from '@nestjs/common';
declare const LocalAuthGuard_base: import("@nestjs/passport").Type<import("@nestjs/passport").IAuthGuard>;
export declare class LocalAuthGuard extends LocalAuthGuard_base {
    handleRequest<TUser = unknown>(err: Error | null, user: TUser | false, _info: unknown, _context: ExecutionContext, _status?: unknown): TUser;
}
export {};
