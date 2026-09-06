export const ErrorMessages: Record<string, string> = {
  // User
  "user:not-found": "Пользователь не найден",
  "user:already-exists": "Пользователь уже существует",
  "user:invalid-credentials": "Неверный email или пароль",
  "user:email-exists": "Пользователь с таким email уже существует",
  "user:access-denied": "Доступ к профилю ограничен",
  "user:invalid-token": "Недействительный токен подтверждения",
  "user:email-not-confirmed": "Email не подтвержден",
  "user:email-already-confirmed": "Email уже подтвержден",

  // App
  "app:internal-error": "Внутренняя ошибка сервера",
  "app:validation-failed": "Ошибка валидации данных",
  "app:forbidden": "Доступ запрещен",
  "app:unauthorized": "Необходима авторизация",
  "app:not-found": "Ресурс не найден",
  "app:conflict": "Данные конфликтуют с существующей записью",
  "app:payload-too-large": "Размер файла превышает допустимый",

  // Skill
  "skill:not-found": "Навык не найден",
  "skill:already-exists": "Навык уже добавлен",
  "skill:access-denied": "Нет доступа к управлению навыком",

  // Request
  "request:not-found": "Запрос не найден",
  "request:already-exists": "Запрос уже существует",
  "request:access-denied": "Нет доступа к этому запросу",
  "request:invalid-status": "Некорректный статус запроса",
  "request:self-request": "Нельзя отправить запрос самому себе",

  // Favorite
  "favorite:not-found": "Избранное не найдено",
  "favorite:already-exists": "Уже добавлено в избранное",

  // Mail
  "mail:too-many-requests": "Слишком много запросов. Попробуйте позже",

  // Upload
  "upload:file-required": "Необходимо выбрать файл",
  "upload:invalid-image-type": "Недопустимый формат изображения",
  "upload:upload-failed": "Не удалось загрузить файл",

  // Category
  "category:not-found": "Категория не найдена",
  "category:subcategory-not-found": "Подкатегория не найдена",
};
