import type { ErrorResponse, Error } from "./types";
import { ErrorCodes, ErrorMessages } from "./errors";

const handleBuisnesError = (error: Error): ErrorResponse => {
  const message = ErrorMessages[error.code] || "Что-то пошло не так";
  const errorCode = `${error.statusCode}${ErrorCodes[error.code]}` || "5000000";

  return {
    message,
    errorCode,
    originalError: error,
  };
};

export const handleError = (error: unknown): ErrorResponse => {
  if (
    error &&
    typeof error === "object" &&
    "code" in error &&
    "statusCode" in error
  ) {
    return handleBuisnesError(error as Error);
  }

  return {
    message: "Ошибка соединения с сервером",
    errorCode: "0000000",
    originalError: {
      code: "network:error",
      path: "",
      statusCode: 0,
      timestamp: new Date(),
    } as Error,
  };
};
