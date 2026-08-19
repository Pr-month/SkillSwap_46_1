export const errorConfig = {
  403: {
    image: "/src/assets/images/error-403.svg",
    title: "Доступ запрещен",
    message: "У вас нет прав для просмотра этой страницы",
  },
  404: {
    image: "/src/assets/images/error-404.svg",
    title: "Страница не найдена",
    message:
      "К сожалению, эта страница недоступна. Вернитесь на главную страницу и попробуйте позже",
  },
  405: {
    image: "/src/assets/images/error-405.svg",
    title: "Метод не поддерживается",
    message: "Запрошенный метод не поддерживается для этого ресурса",
  },
  408: {
    image: "/src/assets/images/error-408.svg",
    title: "Время ожидания истекло",
    message: "Сервер не ответил вовремя. Попробуйте обновить страницу",
  },
  500: {
    image: "/src/assets/images/error-500.svg",
    title: "Ошибка сервера",
    message: "На сервере произошла ошибка. Попробуйте позже",
  },
} as const;

export type ErrorCode = keyof typeof errorConfig;
