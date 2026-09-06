import type { ErrorResponse, Error } from "./types";
import { ErrorMessages } from "./errors";

export const handleError = (error: unknown): ErrorResponse => {
  if (
    error &&
    typeof error === "object" &&
    "code" in error &&
    "statusCode" in error
  ) {
    const apiError = error as Error;

    return {
      message: ErrorMessages[apiError.code] || "Что-то пошло не так",
      errorCode: apiError.code,
      originalError: apiError,
    };
  }

  return {
    message: "Ошибка соединения с сервером",
    errorCode: "network:error",
    originalError: {
      code: "network:error",
      path: "",
      statusCode: 0,
      timestamp: new Date().toISOString(),
      message: "Ошибка соединения с сервером",
    } as Error,
  };
};
