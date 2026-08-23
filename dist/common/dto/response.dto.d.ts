export declare class PaginatedResponseDto<T> {
    data: T[];
    page: number;
    totalPages: number;
    constructor(data: T[], page: number, total: number, limit: number);
}
