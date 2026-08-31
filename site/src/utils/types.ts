//! ======= БАЗОВЫЕ ТИПЫ ДАННЫХ =======
/** ИДЕНТИФИКАОР */
export type TId = string;

/** ПОЛ ПОЛЬЗОВАТЕЛЯ */
export type TGender = "male" | "female" | "unspecified";

/** ПОЛЬЗОВАТЕЛЬ */
export interface IUser {
  email: string;
  name: string;
}

/** ПРОФИЛЬ ПОЛЬЗОВАТЕЛЯ */
export interface IUserProfile extends IUser {
  id?: TId;
  birthDate: string;
  gender?: TGender;
  city: string;
  avatar: string;
  aboutMe?: string; // "о себе"
  likesSkillsIds: TId[]; // массив id навыков, которые лайкнул пользователь
  userSkill: TId; // навык пользователя, которому он может научить
  interestedSkillsSubcategoriesIds: TId[]; // id[] покатегорий, которым пользователь хочет научиться
  createdAt: string;
  updatedAt: string;
}

/** ПОДКАТЕГОРИЯ НАВЫКОВ */
export interface ISkillsSubcategory {
  id: TId;
  name: string;
  skillCategoryId: TId; // id родительской категории
}

/** КАТЕГОРИЯ НАВЫКОВ */
export interface ISkillsCategory {
  id: TId;
  name: string;
  subcategories: ISkillsSubcategory[];
}

/** ГОРОД */
export interface ICity {
  id: TId;
  name: string;
  district: string;
  subject: string;
  population: number;
  lat: number;
  lon: number;
}

/** НАВЫК
 *
 * Ограничения:
 * 1. Пользовтель может НАУЧИТЬ ТОЛЬКО ОДНОМУ НАВЫКУ.
 * 2. Пользователь может выбрать НЕСКОЛЬКО НАВЫКОВ, которым хочет НАУЧИТЬСЯ, ИЗ РАЗНЫХ КАТЕГОРИЙ.
 */
export interface ISkill {
  id?: TId;
  title: string;
  description: string;
  skillSubcategory: TId;
  images: string[];
  userId: TId;
  createdAt: string; // дата создания навыка
  updatedAt: string; // дата обновления навыка
}

//! ======= API =======

export type TServerResponse<T> = {
  status: boolean;
} & T;

//* === ПОЛЬЗОВАТЕЛЬ ===

/** ДАННЫЕ ДЛЯ ЗАПРОСА РЕГИСТРАЦИИ */
export type IRegisterUserData = Pick<
  IUserProfile,
  "email" | "name" | "birthDate" | "gender" | "city" | "avatar"
> & {
  password: string;
};

/** ДАННЫЕ ДЛЯ ЗАПРОСА АВТОРИЗАЦИИ */
export type TLoginUserData = Pick<IUser, "email"> & {
  password: string;
};

/** ОТВЕТ НА ЗАПРОС АВТОРИЗАЦИИ */
export type TLoginUserResponse = TServerResponse<{
  access_token: string;
  user: IUserProfile;
}>;

/** ДАННЫЕ ДЛЯ ЗАПРОСА ОБНОВЛЕНИЕ ДАННЫХ ПОЛЬЗОВАТЕЛЯ */
export type TUpdateUserData = Omit<IUserProfile, "createdAt" | "updatedAt">;

/** ОТВЕТ НА ЗАПРОС ОБНОВЛЕНИЯ ДАННЫХ ПОЛЬЗОВАТЕЛЯ */
export type TUpdateUserResponse = TServerResponse<IUserProfile>;

//* === КАТЕГОРИЯ ===

/** ОТВЕТ НА ЗАПРОС ПОЛУЧЕНИЯ КАТЕГОРИЙ */
export type TGetCategoriesResponse = TServerResponse<ISkillsCategory[]>;

/** ОТВЕТ НА ПОЛУЧЕНИЕ КАТЕГОРИИ ПО ЕЕ ID */
export type TGetCategoryByIdResponse = TServerResponse<ISkillsCategory>;

/** ПОЛУЧЕНИЕ ПОДКАТЕГОРИЙ КАТЕГОРИИ ПО ЕЕ ID */
export type TGetSubcategoriesByCategoryIdResponse = TServerResponse<
  ISkillsSubcategory[]
>;

//* === НАВЫК ===

/** ДАННЫЕ НАВЫКА В ОТВЕТЕ */
export type TSkillResponse = TServerResponse<{
  data: ISkill & { id: TId };
}>;

/** ДАННЫЕ МАССИВА НАВЫКОВ В ОТВЕТЕ */
export type TSkillsResponse = TServerResponse<{
  status: boolean;
  data: ISkill[];
  page: number;
  totalPages: number;
}>;

/** ДАННЫЕ ДЛЯ ЗАПРОСА ДОБАВЛЕНИЯ НАВЫКА */
export type TSkillData = Omit<
  ISkill,
  "id" | "userId" | "updatedAt" | "createdAt"
>;

/** ДАННЫЕ ДЛЯ ЗАПРОСА МОДИФИКАЦИИ НАВЫКА */
export type TModifySkillData = Partial<
  Omit<ISkill, "id" | "userId" | "updatedAt" | "createdAt">
> & { id: TId };

/** ДАННЫЕ ЗАПРОСА НА ОБМЕН НАВЫКАМИ */
export interface ISkillExchangeData {
  userSkill: TId; // навык, которому пользователь может научить
  requiredSkillUserId: TId; // id пользователя с необходимым навыком
  message: string; // сообщение
}

/** ОТВЕТ НА ЗАПРОС ОБМЕНА НАВЫКАМИ */
export type TRequestStatus =
  "pending" | "accepted" | "rejected" | "inProgress" | "done";

export interface ISkillExchange {
  id: TId;
  userSkill: TId;
  requiredSkillUserId: TId;
  message?: string;
  createdAt: string;
  status?: TRequestStatus;
  fromUserId?: TId;
  toUserId?: TId;
  updatedAt?: string;
}

export type UploadResponse = {
  url: string;
  filename: string;
  size: number; // в байтах
};

export interface IMyRequests {
  sent: ISkillExchange[];
  received: ISkillExchange[];
}
