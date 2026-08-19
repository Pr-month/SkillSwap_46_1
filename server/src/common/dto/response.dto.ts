export class PaginatedResponseDto<T> {
  data: T[];
  page: number;
  totalPages: number;

  constructor(data: T[], page: number, total: number, limit: number) {
    this.data = data;
    this.page = page;
    this.totalPages = Math.ceil(total / limit);
  }
}
