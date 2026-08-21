import { beforeEach, jest, describe, expect, it } from "@jest/globals";
import { configureStore } from "@reduxjs/toolkit";
import userReducer from "./slice";
import { fetchUsers, fetchUserById, removeUser } from "./actions";
import * as userApi from "../../api/userApi";
import type { IUserProfile } from "../../utils/types";

jest.mock("../../api/userApi");
const mockedUserApi = userApi as jest.Mocked<typeof userApi>;

const mockUser: IUserProfile = {
  id: "user-1",
  email: "test@test.com",
  name: "Test User",
  birthDate: "2000-01-01",
  gender: "male",
  city: "Moscow",
  avatar: "avatar.png",
  likesSkillsIds: [],
  userSkill: "skill-1",
  interestedSkillsSubcategoriesIds: [],
  createdAt: "2024-01-01T00:00:00.000Z",
  updatedAt: "2024-01-01T00:00:00.000Z",
};

const createTestStore = () =>
  configureStore({
    reducer: { user: userReducer },
    middleware: (getDefaultMiddleware) =>
      getDefaultMiddleware({ serializableCheck: false }),
  });

describe("user thunks", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  //fetchUsers
  describe("fetchUsers", () => {
    it("fulfilled: загружает список пользователей", async () => {
      mockedUserApi.getUsers.mockResolvedValue({
        data: [mockUser],
        page: 1,
        totalPages: 1,
      });

      const store = createTestStore();
      await store.dispatch(fetchUsers({ page: 1, limit: 20 }));

      expect(mockedUserApi.getUsers).toHaveBeenCalledWith({ page: 1, limit: 20 });
      expect(store.getState().user.list).toEqual([mockUser]);
      expect(store.getState().user.loading).toBe(false);
    });

    it("пробрасывает фильтры в getUsers", async () => {
      mockedUserApi.getUsers.mockResolvedValue({
        data: [mockUser],
        page: 1,
        totalPages: 1,
      });

      const store = createTestStore();
      await store.dispatch(
        fetchUsers({
          page: 1,
          limit: 20,
          search: "JavaScript",
          gender: "male",
          cities: ["Moscow"],
          subCategoryIds: ["sub-1"],
          skillOption: "can-teach",
        }),
      );

      expect(mockedUserApi.getUsers).toHaveBeenCalledWith({
        page: 1,
        limit: 20,
        search: "JavaScript",
        gender: "male",
        cities: ["Moscow"],
        subCategoryIds: ["sub-1"],
        skillOption: "can-teach",
      });
    });

    it("rejected: ошибка API", async () => {
      mockedUserApi.getUsers.mockRejectedValue("Network error");

      const store = createTestStore();
      const result = await store.dispatch(fetchUsers({ page: 1, limit: 20 }));

      expect(result.meta.requestStatus).toBe("rejected");
      expect(store.getState().user.list).toEqual([]);
    });
  });

  //fetchUserById
  describe("fetchUserById", () => {
    it("fulfilled: загружает пользователя по id", async () => {
      mockedUserApi.getUserById.mockResolvedValue(mockUser);

      const store = createTestStore();
      await store.dispatch(fetchUserById("user-1"));

      expect(mockedUserApi.getUserById).toHaveBeenCalledWith("user-1");
      expect(store.getState().user.selectedUser).toEqual(mockUser);
    });

    it("rejected: ошибка API", async () => {
      mockedUserApi.getUserById.mockRejectedValue("Not found");

      const store = createTestStore();
      const result = await store.dispatch(fetchUserById("user-999"));

      expect(result.meta.requestStatus).toBe("rejected");
      expect(store.getState().user.selectedUser).toBeNull();
    });
  });

  //removeUser
  describe("removeUser", () => {
    it("fulfilled: вызывает deleteUser и возвращает id", async () => {
      mockedUserApi.deleteUser.mockResolvedValue(undefined);

      const store = createTestStore();
      const result = await store.dispatch(
        removeUser({ id: "user-1", token: "tok" }),
      );

      expect(mockedUserApi.deleteUser).toHaveBeenCalledWith("user-1", "tok");
      expect(result.payload).toBe("user-1");
    });

    it("rejected: ошибка API", async () => {
      mockedUserApi.deleteUser.mockRejectedValue("Delete failed");

      const store = createTestStore();
      const result = await store.dispatch(
        removeUser({ id: "user-1", token: "tok" }),
      );

      expect(result.meta.requestStatus).toBe("rejected");
    });
  });
});
