export declare class PaginationDto {
    page: number;
    limit: number;
    search: string;
    category?: string;
    get skip(): number;
}
