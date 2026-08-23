import { ExecutionContext } from '@nestjs/common';
declare const JwtAuthGuard_base: import("@nestjs/passport").Type<import("@nestjs/passport").IAuthGuard>;
export declare class JwtAuthGuard extends JwtAuthGuard_base {
    handleRequest<TUser = unknown>(err: Error | null, user: TUser | false, info: unknown, _context: ExecutionContext, _status?: unknown): TUser;
}
export {};
