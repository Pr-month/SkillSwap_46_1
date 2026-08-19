export const ErrorMessages: Record<string, string> = {
  "user:not-found": "Пользователь не найден",
  "user:already-exists": "Пользователь уже существует",
  "user:invalid-credentials": "Неверный email или пароль",
  "user:email-exists": "Пользователь с таким email уже существует",
  "user:access-denied": "Доступ к профилю ограничен",

  "app:internal-error": "Внутренняя ошибка сервера",
  "app:validation-failed": "Ошибка валидации данных",
  "app:forbidden": "Доступ запрещен",
  "app:unauthorized": "Необходима авторизация",

  "skill:not-found": "Навык не найден",
  "skill:already-exists": "Навык уже добавлен",
  "skill:access-denied": "Нет доступа к управлению навыком",

  "request:not-found": "Запрос не найден",
  "request:already-exists": "Запрос уже существует",
  "request:access-denied": "Нет доступа к этому запросу",
  "request:invalid-status": "Некорректный статус запроса",
  "request:self-request": "Нельзя отправить запрос самому себе",

  "favorite:not-found": "Избранное не найдено",
  "favorite:already-exists": "Уже добавлено в избранное",
};

const generateErrorCodes = (): Record<string, string> => {
  const errorCodes: Record<string, string> = {};

  let currentPrefix = "";
  let groupNumber = 0;
  let errorNumber = 0;

  for (const [key] of Object.entries(ErrorMessages)) {
    const prefix = key.split(":")[0];

    if (currentPrefix !== prefix) {
      currentPrefix = prefix;
      groupNumber++;
      errorNumber = 0;
    }

    errorNumber++;
    errorCodes[key] =
      `${groupNumber.toString().padStart(2, "0")}${errorNumber.toString().padStart(2, "0")}`;
  }

  return errorCodes;
};

export const ErrorCodes = generateErrorCodes();
