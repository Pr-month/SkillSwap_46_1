export declare class CreateSubcategoryDto {
    name: string;
    categoryId: string;
}
declare const UpdateSubcategoryDto_base: import("@nestjs/common").Type<Partial<CreateSubcategoryDto>>;
export declare class UpdateSubcategoryDto extends UpdateSubcategoryDto_base {
}
export {};
