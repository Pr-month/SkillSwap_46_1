import type { ISkillsCategory, ISkillsSubcategory } from "../../utils/types";

// Моковые подкатегории (id — это TId = string)
const SUBCATEGORIES: Record<string, ISkillsSubcategory[]> = {
  business: [
    {
      id: "team-management",
      name: "Управление командой",
      skillCategoryId: "business",
    },
    {
      id: "marketing",
      name: "Маркетинг и реклама",
      skillCategoryId: "business",
    },
    { id: "sales", name: "Продажи и переговоры", skillCategoryId: "business" },
    { id: "personal-brand", name: "Личный бренд", skillCategoryId: "business" },
    {
      id: "resume",
      name: "Резюме и собеседование",
      skillCategoryId: "business",
    },
    {
      id: "time-management",
      name: "Тайм-менеджмент",
      skillCategoryId: "business",
    },
    {
      id: "project-management",
      name: "Проектное управление",
      skillCategoryId: "business",
    },
    {
      id: "entrepreneurship",
      name: "Предпринимательство",
      skillCategoryId: "business",
    },
  ],
  languages: [
    { id: "english", name: "Английский", skillCategoryId: "languages" },
    { id: "french", name: "Французский", skillCategoryId: "languages" },
    { id: "german", name: "Немецкий", skillCategoryId: "languages" },
    { id: "spanish", name: "Испанский", skillCategoryId: "languages" },
    { id: "chinese", name: "Китайский", skillCategoryId: "languages" },
    { id: "japanese", name: "Японский", skillCategoryId: "languages" },
    {
      id: "exam-prep",
      name: "Подготовка к экзаменам (IELTS, TOEFL)",
      skillCategoryId: "languages",
    },
  ],
  home: [
    { id: "cleaning", name: "Уборка и организация", skillCategoryId: "home" },
    { id: "home-finance", name: "Домашние финансы", skillCategoryId: "home" },
    { id: "cooking", name: "Приготовление еды", skillCategoryId: "home" },
    { id: "plants", name: "Домашние растения", skillCategoryId: "home" },
    { id: "repair", name: "Ремонт", skillCategoryId: "home" },
    { id: "storage", name: "Хранение вещей", skillCategoryId: "home" },
  ],
  creative: [
    {
      id: "drawing",
      name: "Рисование и иллюстрация",
      skillCategoryId: "creative",
    },
    { id: "photography", name: "Фотография", skillCategoryId: "creative" },
    { id: "video-editing", name: "Видеомонтаж", skillCategoryId: "creative" },
    { id: "music", name: "Музыка и звук", skillCategoryId: "creative" },
    { id: "acting", name: "Актёрское мастерство", skillCategoryId: "creative" },
    {
      id: "creative-writing",
      name: "Креативное письмо",
      skillCategoryId: "creative",
    },
    { id: "art-therapy", name: "Арт-терапия", skillCategoryId: "creative" },
    { id: "diy", name: "Декор и DIY", skillCategoryId: "creative" },
  ],
  education: [
    {
      id: "personal-growth",
      name: "Личностное развитие",
      skillCategoryId: "education",
    },
    {
      id: "learning-skills",
      name: "Навыки обучения",
      skillCategoryId: "education",
    },
    {
      id: "cognitive",
      name: "Когнитивные техники",
      skillCategoryId: "education",
    },
    { id: "speed-reading", name: "Скорочтение", skillCategoryId: "education" },
    {
      id: "teaching",
      name: "Навыки преподавания",
      skillCategoryId: "education",
    },
    { id: "coaching", name: "Коучинг", skillCategoryId: "education" },
  ],
  health: [
    { id: "yoga", name: "Йога и медитация", skillCategoryId: "health" },
    { id: "nutrition", name: "Питание и ЗОЖ", skillCategoryId: "health" },
    {
      id: "mental-health",
      name: "Ментальное здоровье",
      skillCategoryId: "health",
    },
    { id: "mindfulness", name: "Осознанность", skillCategoryId: "health" },
    { id: "fitness", name: "Физические тренировки", skillCategoryId: "health" },
    { id: "sleep", name: "Сон и восстановление", skillCategoryId: "health" },
    {
      id: "work-life-balance",
      name: "Баланс жизни и работы",
      skillCategoryId: "health",
    },
  ],
};

// Формируем категории в формате ISkillsCategory
export const SKILL_CATEGORIES: ISkillsCategory[] = [
  {
    id: "business",
    name: "Бизнес и карьера",
    subcategories: SUBCATEGORIES.business,
  },
  {
    id: "languages",
    name: "Иностранные языки",
    subcategories: SUBCATEGORIES.languages,
  },
  { id: "home", name: "Дом и уют", subcategories: SUBCATEGORIES.home },
  {
    id: "creative",
    name: "Творчество и искусство",
    subcategories: SUBCATEGORIES.creative,
  },
  {
    id: "education",
    name: "Образование и развитие",
    subcategories: SUBCATEGORIES.education,
  },
  {
    id: "health",
    name: "Здоровье и лайфстайл",
    subcategories: SUBCATEGORIES.health,
  },
];

// Утилита: получить все ID подкатегорий плоским списком
export const getAllSubcategoryIds = (): string[] =>
  SKILL_CATEGORIES.flatMap((cat) => cat.subcategories.map((sub) => sub.id));

// Утилита: найти подкатегорию по ID
export const getSubcategoryById = (
  id: string,
): ISkillsSubcategory | undefined =>
  SKILL_CATEGORIES.flatMap((cat) => cat.subcategories).find(
    (sub) => sub.id === id,
  );
