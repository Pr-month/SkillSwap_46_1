export const exceptionCodes = {
  users: {
    notFound: 'user:not-found',
    alreadyExists: 'user:already-exists',
    invalidCredentials: 'user:invalid-credentials',
    emailExists: 'user:email-exists',
    accessDenied: 'user:access-denied',
  },
  auth: {
    invalidAccessToken: 'auth:invalid-access-token',
    expiredAccessToken: 'auth:expired-access-token',
  },
  skills: {
    notFound: 'skill:not-found',
    alreadyExists: 'skill:already-exists',
    accessDenied: 'skill:access-denied',
  },
  requests: {
    notFound: 'request:not-found',
    alreadyExists: 'request:already-exists',
    accessDenied: 'request:access-denied',
    invalidStatus: 'request:invalid-status',
    selfRequest: 'request:self-request',
  },
  favorites: {
    notFound: 'favorite:not-found',
    alreadyExists: 'favorite:already-exists',
  },
  upload: {
    fileRequired: 'upload:file-required',
    invalidImageType: 'upload:invalid-image-type',
    uploadFailed: 'upload:upload-failed',
  },
  categories: {
    notFound: 'category:not-found',
    subcategoryNotFound: 'category:subcategory-not-found',
  },
  common: {
    internal: 'app:internal-error',
    validation: 'app:validation-failed',
    unauthorized: 'app:unauthorized',
    forbidden: 'app:forbidden',
    notFound: 'app:not-found',
    conflict: 'app:conflict',
    payloadTooLarge: 'app:payload-too-large',
  },
} as const;

type ExceptionGroup = (typeof exceptionCodes)[keyof typeof exceptionCodes];
export type ExceptionCode = ExceptionGroup extends infer Group
  ? Group extends Record<string, string>
    ? Group[keyof Group]
    : never
  : never;

export const exceptionMessages: Record<ExceptionCode, string> = {
  'user:not-found': 'Пользователь не найден',
  'user:already-exists': 'Пользователь уже существует',
  'user:invalid-credentials': 'Неверный email или пароль',
  'user:email-exists': 'Пользователь с таким email уже существует',
  'user:access-denied': 'Нет доступа к данным пользователя',
  'auth:invalid-access-token': 'Недействительный access token',
  'auth:expired-access-token': 'Срок действия access token истёк',
  'skill:not-found': 'Навык не найден',
  'skill:already-exists': 'Такой навык уже существует',
  'skill:access-denied': 'Нет доступа к навыку',
  'request:not-found': 'Заявка не найдена',
  'request:already-exists': 'Такая заявка уже существует',
  'request:access-denied': 'Нет доступа к заявке',
  'request:invalid-status': 'Недопустимый статус заявки',
  'request:self-request': 'Нельзя отправить заявку самому себе',
  'favorite:not-found': 'Запись в избранном не найдена',
  'favorite:already-exists': 'Навык уже добавлен в избранное',
  'upload:file-required': 'Необходимо выбрать файл',
  'upload:invalid-image-type': 'Недопустимый формат изображения',
  'upload:upload-failed': 'Не удалось загрузить файл',
  'category:not-found': 'Категория не найдена',
  'category:subcategory-not-found': 'Подкатегория не найдена',
  'app:internal-error': 'Внутренняя ошибка сервера',
  'app:validation-failed': 'Переданы некорректные данные',
  'app:unauthorized': 'Требуется авторизация',
  'app:forbidden': 'Доступ запрещён',
  'app:not-found': 'Ресурс не найден',
  'app:conflict': 'Данные конфликтуют с существующей записью',
  'app:payload-too-large': 'Размер файла превышает допустимый',
};

export function isExceptionCode(value: unknown): value is ExceptionCode {
  return typeof value === 'string' && value in exceptionMessages;
}
