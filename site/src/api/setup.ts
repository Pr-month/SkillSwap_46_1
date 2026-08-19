import { interceptors } from "./interceptors";

export function setupApiInterceptors() {
  interceptors.addRequestInterceptor(async (url, config) => {
    const token = localStorage.getItem("accessToken");

    if (token) {
      config.headers = {
        ...config.headers,
        Authorization: `Bearer ${token}`,
      };
    }

    return { url, config };
  });

  interceptors.addResponseInterceptor(async (response) => {
    return response;
  });

  interceptors.addErrorInterceptor(async (error) => {
    return Promise.reject(error);
  });
}
