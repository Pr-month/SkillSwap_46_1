export type RequestInterceptor = (
  url: string,
  config: RequestInit,
) =>
  | Promise<{ url: string; config: RequestInit }>
  | { url: string; config: RequestInit };

export type ResponseInterceptor = <T>(response: T) => T | Promise<T>;
export type ErrorInterceptor = (error: unknown) => Promise<never>;

class InterceptorManager {
  private requestInterceptors: RequestInterceptor[] = [];
  private responseInterceptors: ResponseInterceptor[] = [];
  private errorInterceptors: ErrorInterceptor[] = [];

  addRequestInterceptor(interceptor: RequestInterceptor): () => void {
    this.requestInterceptors.push(interceptor);
    return () => {
      const index = this.requestInterceptors.indexOf(interceptor);
      if (index !== -1) this.requestInterceptors.splice(index, 1);
    };
  }

  addResponseInterceptor(interceptor: ResponseInterceptor): () => void {
    this.responseInterceptors.push(interceptor);
    return () => {
      const index = this.responseInterceptors.indexOf(interceptor);
      if (index !== -1) this.responseInterceptors.splice(index, 1);
    };
  }

  addErrorInterceptor(interceptor: ErrorInterceptor): () => void {
    this.errorInterceptors.push(interceptor);
    return () => {
      const index = this.errorInterceptors.indexOf(interceptor);
      if (index !== -1) this.errorInterceptors.splice(index, 1);
    };
  }

  async applyRequestInterceptors(
    url: string,
    config: RequestInit,
  ): Promise<{ url: string; config: RequestInit }> {
    let result = { url, config };
    for (const interceptor of this.requestInterceptors) {
      result = await interceptor(result.url, result.config);
    }
    return result;
  }

  async applyResponseInterceptors<T>(response: T): Promise<T> {
    let result = response;
    for (const interceptor of this.responseInterceptors) {
      result = await interceptor(result);
    }
    return result;
  }

  async applyErrorInterceptors(error: unknown): Promise<never> {
    let result = error;
    for (const interceptor of this.errorInterceptors) {
      try {
        await interceptor(result);
      } catch (newError) {
        result = newError;
      }
    }
    throw result;
  }
}

export const interceptors = new InterceptorManager();
