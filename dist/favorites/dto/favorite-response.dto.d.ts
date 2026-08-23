export declare class FavoriteSkillOwnerDto {
    id: string;
    name: string;
    avatar?: string | null;
}
export declare class FavoriteSkillDto {
    id: string;
    title: string;
    description: string;
    images: string[];
    category: string;
    subcategory?: string;
    owner?: FavoriteSkillOwnerDto;
}
export declare class FavoriteDto {
    id: string;
    userId: string;
    skillId: string;
    createdAt: string;
    skill?: FavoriteSkillDto;
}
export declare class FavoriteCheckDto {
    isFavorite: boolean;
}
