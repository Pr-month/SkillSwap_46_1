import { interceptors } from "./interceptors";

export function setupApiInterceptors() {
  interceptors.addRequestInterceptor(async (url, config) => {
    return { url, config };
  });

  interceptors.addResponseInterceptor(async (response) => {
    return response;
  });

  interceptors.addErrorInterceptor(async (error) => {
    return Promise.reject(error);
  });
}
