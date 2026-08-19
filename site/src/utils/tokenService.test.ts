import { beforeEach, describe, expect, it } from "@jest/globals";
import { tokenService } from "./tokenService";

// Мок localStorage
const localStorageMock = (() => {
  let store: Record<string, string> = {};
  return {
    getItem: (key: string) => store[key] ?? null,
    setItem: (key: string, value: string) => {
      store[key] = value;
    },
    removeItem: (key: string) => {
      delete store[key];
    },
    clear: () => {
      store = {};
    },
  };
})();

Object.defineProperty(global, "localStorage", { value: localStorageMock });

describe("tokenService", () => {
  beforeEach(() => {
    localStorageMock.clear();
  });

  it("get: возвращает null если токен не установлен", () => {
    expect(tokenService.get()).toBeNull();
  });

  it("set + get: сохраняет и возвращает токен", () => {
    tokenService.set("my-token-123");
    expect(tokenService.get()).toBe("my-token-123");
  });

  it("set: перезаписывает существующий токен", () => {
    tokenService.set("token-1");
    tokenService.set("token-2");
    expect(tokenService.get()).toBe("token-2");
  });

  it("remove: удаляет токен", () => {
    tokenService.set("my-token");
    tokenService.remove();
    expect(tokenService.get()).toBeNull();
  });

  it("remove: не падает если токена нет", () => {
    expect(() => tokenService.remove()).not.toThrow();
  });

  it("использует ключ jwt_token в localStorage", () => {
    tokenService.set("test-token");
    expect(localStorageMock.getItem("jwt_token")).toBe("test-token");
  });
});
