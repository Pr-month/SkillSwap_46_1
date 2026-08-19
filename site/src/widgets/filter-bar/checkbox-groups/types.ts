export type TCityCheckboxGroupProps = {
  value?: string[];
  onChange?: (values: string[]) => void;
};

export type TSkillCategoryCheckboxGroupProps = {
  value?: string[];
  onChange?: (values: string[]) => void;
};

// Тип для состояния аккордеона (опционально, если выносить логику)
export type TExpandedCategories = Record<string, boolean>;
