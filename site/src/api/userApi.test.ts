import { beforeEach, jest, describe, expect, it } from "@jest/globals";
import { request } from "./client";
import { getUsers } from "./userApi";

jest.mock("./client", () => ({
  request: jest.fn(),
}));

const mockedRequest = request as jest.MockedFunction<typeof request>;

describe("userApi.getUsers", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("вызывает POST /users/search с дефолтным JSON-body", async () => {
    mockedRequest.mockResolvedValue({
      status: true,
      data: { data: [], page: 1, totalPages: 1 },
    });

    await getUsers();

    expect(mockedRequest).toHaveBeenCalledTimes(1);
    expect(mockedRequest).toHaveBeenCalledWith("/users/search", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ page: 1, limit: 20 }),
    });
  });

  it("сериализует фильтры в JSON-body и отбрасывает пустые/all/пустые массивы", async () => {
    mockedRequest.mockResolvedValue({
      status: true,
      data: { data: [], page: 2, totalPages: 1 },
    });

    await getUsers({
      page: 2,
      limit: 10,
      search: "  JavaScript  ",
      gender: "female",
      cities: ["Москва", ""],
      subCategoryIds: ["uuid-1"],
      skillOption: "can-teach",
    });

    expect(mockedRequest).toHaveBeenCalledWith("/users/search", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        page: 2,
        limit: 10,
        search: "JavaScript",
        gender: "female",
        cities: ["Москва"],
        subCategoryIds: ["uuid-1"],
        skillOption: "can-teach",
      }),
    });
  });

  it("не отправляет `all`-значения gender/skillOption", async () => {
    mockedRequest.mockResolvedValue({
      status: true,
      data: { data: [], page: 1, totalPages: 1 },
    });

    await getUsers({ gender: "all", skillOption: "all" });

    expect(mockedRequest).toHaveBeenCalledWith("/users/search", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ page: 1, limit: 20 }),
    });
  });

  it("возвращает data из ответа", async () => {
    mockedRequest.mockResolvedValue({
      status: true,
      data: { data: [], page: 1, totalPages: 3 },
    });

    const result = await getUsers();

    expect(result).toEqual({ data: [], page: 1, totalPages: 3 });
  });
});
