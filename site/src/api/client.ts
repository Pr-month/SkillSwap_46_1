import type { Error as ApiError } from "../utils/errors/types";
import { interceptors } from "./interceptors";
import { handleError } from "../utils/errors/errorUtils";
import { showToast } from "../utils/toast";

interface RequestConfig extends RequestInit {
  showErrorToast?: boolean;
  showSuccessToast?: boolean;
}

const API_BASE_URL = "/api";
function addBaseUrl(url: string): string {
  return url.startsWith("http") ? url : `${API_BASE_URL}${url}`;
}

async function parseErrorResponse(
  response: Response,
): Promise<ApiError | null> {
  try {
    const data = await response.json();
    if (data && typeof data === "object" && "code" in data) {
      return data as ApiError;
    }
    return null;
  } catch {
    return null;
  }
}

export async function request<T>(
  url: string,
  config: RequestConfig = {},
): Promise<T> {
  const { showErrorToast = true, ...fetchConfig } = config;

  const isFormData = fetchConfig.body instanceof FormData;

  try {
    const { url: interceptedUrl, config: interceptedConfig } =
      await interceptors.applyRequestInterceptors(addBaseUrl(url), {
        ...fetchConfig,
        headers: {
          ...(!isFormData && { "Content-Type": "application/json" }),
          ...fetchConfig.headers,
        },
      });

    const response = await fetch(interceptedUrl, interceptedConfig);

    if (response.ok) {
      let data: T;
      if (response.status === 204) {
        data = {} as T;
      } else {
        const contentType = response.headers.get("content-type");
        if (contentType?.includes("application/json")) {
          data = await response.json();
        } else {
          data = (await response.text()) as T;
        }
      }

      return await interceptors.applyResponseInterceptors(data);
    }

    const errorData = await parseErrorResponse(response);

    if (showErrorToast) {
      const { message, errorCode } = handleError(
        errorData || {
          code: "unknown",
          statusCode: response.status,
          path: url,
          timestamp: new Date().toISOString(),
        },
      );

      if (response.status >= 500) {
        showToast("Ошибка сервера. Попробуйте позже.", "error");
      } else {
        showToast(message, "error", errorCode);
      }
    }

    const error = errorData || {
      code: "unknown",
      statusCode: response.status,
      path: url,
      timestamp: new Date().toISOString(),
    };

    await interceptors.applyErrorInterceptors(error);
    throw error;
  } catch (error) {
    if (error instanceof TypeError && error.message === "Failed to fetch") {
      const { message } = handleError(null);
      showToast(message, "error");

      const networkError = {
        code: "network:offline",
        statusCode: 0,
        path: url,
        timestamp: new Date().toISOString(),
      };

      await interceptors.applyErrorInterceptors(networkError);
      throw networkError;
    }

    throw error;
  }
}

export const api = {
  get: <T>(url: string, config?: RequestConfig) =>
    request<T>(url, { ...config, method: "GET" }),

  post: <T, D = unknown>(url: string, data?: D, config?: RequestConfig) =>
    request<T>(url, {
      ...config,
      method: "POST",
      body: data ? JSON.stringify(data) : undefined,
    }),

  put: <T, D = unknown>(url: string, data?: D, config?: RequestConfig) =>
    request<T>(url, {
      ...config,
      method: "PUT",
      body: data ? JSON.stringify(data) : undefined,
    }),

  patch: <T, D = unknown>(url: string, data?: D, config?: RequestConfig) =>
    request<T>(url, {
      ...config,
      method: "PATCH",
      body: data ? JSON.stringify(data) : undefined,
    }),

  delete: <T>(url: string, config?: RequestConfig) =>
    request<T>(url, { ...config, method: "DELETE" }),
};
