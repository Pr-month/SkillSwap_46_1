"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PaginatedResponseDto = void 0;
class PaginatedResponseDto {
    constructor(data, page, total, limit) {
        this.data = data;
        this.page = page;
        this.totalPages = Math.ceil(total / limit);
    }
}
exports.PaginatedResponseDto = PaginatedResponseDto;
//# sourceMappingURL=response.dto.js.map