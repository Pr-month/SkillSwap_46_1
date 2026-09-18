import type { IconName } from "../ui/icon/icon";

type CategoryStyle = {
  iconName: IconName;
  iconBackgroundColor: string;
};

/**
 * Маппинг категорий с бэка на иконки и цвета.
 * Ключи — точные названия категорий из БД.
 */
export const CATEGORY_STYLES: Record<string, CategoryStyle> = {
  "Бизнес и карьера": {
    iconName: "briefcase",
    iconBackgroundColor: "var(--color-category-business, #E8DEF8)",
  },
  "Творчество и искусство": {
    iconName: "palette",
    iconBackgroundColor: "var(--color-category-art, #FFD8E4)",
  },
  "Иностранные языки": {
    iconName: "global",
    iconBackgroundColor: "var(--color-category-languages, #D0E4FF)",
  },
  "Образование и развитие": {
    iconName: "book",
    iconBackgroundColor: "var(--color-category-education, #D6F5D6)",
  },
  "Дом и уют": {
    iconName: "home",
    iconBackgroundColor: "var(--color-category-home, #FFE7C2)",
  },
  "Здоровье и лайфстайл": {
    iconName: "lifestyle",
    iconBackgroundColor: "var(--color-category-health, #FFD6D6)",
  },
};

export const DEFAULT_CATEGORY_STYLE: CategoryStyle = {
  iconName: "idea",
  iconBackgroundColor: "var(--color-bg-secondary)",
};

export const getCategoryStyle = (name: string): CategoryStyle =>
  CATEGORY_STYLES[name] ?? DEFAULT_CATEGORY_STYLE;
