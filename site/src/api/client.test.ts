import { beforeEach, describe, expect, it, jest } from "@jest/globals";

import { showToast } from "../utils/toast";
import { request } from "./client";

jest.mock("../utils/toast", () => ({
  showToast: jest.fn(),
}));

const mockedFetch = jest.fn() as jest.MockedFunction<typeof fetch>;
const mockedShowToast = showToast as jest.MockedFunction<typeof showToast>;

global.fetch = mockedFetch;

function createJsonResponse(status: number, body: unknown): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: {
      "Content-Type": "application/json",
    },
  });
}

function createUnauthorizedResponse(): Response {
  return createJsonResponse(401, {
    code: "app:unauthorized",
    message: "Unauthorized",
    statusCode: 401,
    path: "/auth/profile",
    timestamp: "2026-09-10T00:00:00.000Z",
  });
}

describe("API client refresh", () => {
  beforeEach(() => {
    mockedFetch.mockReset();
    mockedShowToast.mockClear();
  });

  it("обновляет токены и повторяет исходный запрос после 401", async () => {
    mockedFetch
      .mockResolvedValueOnce(createUnauthorizedResponse())
      .mockResolvedValueOnce(
        createJsonResponse(200, {
          status: true,
          data: {
            message: "Токены успешно обновлены",
          },
        }),
      )
      .mockResolvedValueOnce(
        createJsonResponse(200, {
          status: true,
          data: {
            id: "user-id",
          },
        }),
      );

    const result = await request<{
      status: boolean;
      data: { id: string };
    }>("/auth/profile");

    expect(result).toEqual({
      status: true,
      data: {
        id: "user-id",
      },
    });

    expect(mockedFetch).toHaveBeenCalledTimes(3);

    expect(mockedFetch).toHaveBeenNthCalledWith(
      1,
      "/api/auth/profile",
      expect.objectContaining({
        credentials: "include",
      }),
    );

    expect(mockedFetch).toHaveBeenNthCalledWith(
      2,
      "/api/auth/refresh",
      expect.objectContaining({
        method: "POST",
        credentials: "include",
      }),
    );

    expect(mockedFetch).toHaveBeenNthCalledWith(
      3,
      "/api/auth/profile",
      expect.objectContaining({
        credentials: "include",
      }),
    );

    expect(mockedShowToast).not.toHaveBeenCalled();
  });

  it("обрабатывает исходную ошибку 401, если refresh не удался", async () => {
    mockedFetch
      .mockResolvedValueOnce(createUnauthorizedResponse())
      .mockResolvedValueOnce(createUnauthorizedResponse());

    await expect(request("/auth/profile")).rejects.toMatchObject({
      code: "app:unauthorized",
      statusCode: 401,
    });

    expect(mockedFetch).toHaveBeenCalledTimes(2);

    expect(mockedFetch).toHaveBeenNthCalledWith(
      2,
      "/api/auth/refresh",
      expect.objectContaining({
        method: "POST",
        credentials: "include",
      }),
    );

    expect(mockedShowToast).toHaveBeenCalledTimes(1);
  });

  it("не запускает refresh, если повтор отключён", async () => {
    mockedFetch.mockResolvedValueOnce(createUnauthorizedResponse());

    await expect(
      request("/auth/login", {
        method: "POST",
        retryOnUnauthorized: false,
      }),
    ).rejects.toMatchObject({
      code: "app:unauthorized",
      statusCode: 401,
    });

    expect(mockedFetch).toHaveBeenCalledTimes(1);
    expect(mockedShowToast).toHaveBeenCalledTimes(1);
  });

  it("показывает toast для ошибки 500 при тихой проверке профиля", async () => {
    mockedFetch.mockResolvedValueOnce(
      createJsonResponse(500, {
        code: "app:internal-error",
        message: "Internal Server Error",
        statusCode: 500,
        path: "/auth/profile",
        timestamp: "2026-09-10T00:00:00.000Z",
      }),
    );

    await expect(
      request("/auth/profile", {
        showUnauthorizedToast: false,
      }),
    ).rejects.toMatchObject({
      code: "app:internal-error",
      statusCode: 500,
    });

    expect(mockedFetch).toHaveBeenCalledTimes(1);
    expect(mockedShowToast).toHaveBeenCalledWith(
      "Ошибка сервера. Попробуйте позже.",
      "error",
    );
  });
});
