import { CallHandler, ExecutionContext, NestInterceptor } from '@nestjs/common';
import { Observable } from 'rxjs';
export interface SuccessResponse<T> {
    status: true;
    data: T;
}
export declare class ResponseInterceptor<T> implements NestInterceptor<T, SuccessResponse<T>> {
    intercept(_context: ExecutionContext, next: CallHandler<T>): Observable<SuccessResponse<T>>;
}
