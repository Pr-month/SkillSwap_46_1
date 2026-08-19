import { beforeEach, describe, expect, jest, it } from "@jest/globals";
import { configureStore } from "@reduxjs/toolkit";
import authReducer from "./slice";
import {
  fetchRegister,
  fetchLogin,
  fetchProfile,
  fetchUpdateCurrentUser,
  fetchCheckUser,
} from "./actions";
import { tokenService } from "../../utils/tokenService";
import * as authApi from "../../api/authApi";
import * as userApi from "../../api/userApi";
import type { IUserProfile, TLoginUserResponse } from "../../utils/types";
import type { AuthState } from "./types";

// Мокаем tokenService
jest.mock("../../utils/tokenService", () => ({
  tokenService: {
    get: jest.fn(),
    set: jest.fn(),
    remove: jest.fn(),
  },
}));

jest.mock("../../api/authApi");
jest.mock("../../api/userApi");

const mockedAuthApi = authApi as jest.Mocked<typeof authApi>;
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
  userSkill: "",
  interestedSkillsSubcategoriesIds: [],
  createdAt: "2024-01-01T00:00:00.000Z",
  updatedAt: "2024-01-01T00:00:00.000Z",
};

const createTestStore = (preloadedAuth?: Partial<AuthState>) =>
  configureStore({
    reducer: { auth: authReducer },
    middleware: (getDefaultMiddleware) =>
      getDefaultMiddleware({ serializableCheck: false }),
    preloadedState: preloadedAuth
      ? {
          auth: {
            ...authReducer(undefined, { type: "@@INIT" }),
            ...preloadedAuth,
          },
        }
      : undefined,
  });

describe("auth thunks", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  // fetchRegister
  describe("fetchRegister", () => {
    const registerData = {
      email: "test@test.com",
      name: "Test",
      birthDate: "2000-01-01",
      gender: "male" as const,
      city: "Moscow",
      avatar: "avatar.png",
      password: "123456",
    };

    it("fulfilled: вызывает registerUser и сохраняет пользователя", async () => {
      const response: TLoginUserResponse = {
        status: true,
        access_token: "token-123",
        user: mockUser,
      };
      mockedAuthApi.registerUser.mockResolvedValue(response);

      const store = createTestStore();
      await store.dispatch(fetchRegister(registerData));

      expect(mockedAuthApi.registerUser).toHaveBeenCalledWith(registerData);
      expect(store.getState().auth.currentUser).toEqual(mockUser);
      expect(store.getState().auth.loading).toBe(false);
    });

    it("rejected: ошибка API → rejectWithValue", async () => {
      mockedAuthApi.registerUser.mockRejectedValue("Network error");

      const store = createTestStore();
      const result = await store.dispatch(fetchRegister(registerData));

      expect(result.meta.requestStatus).toBe("rejected");
      expect(store.getState().auth.currentUser).toBeNull();
    });
  });

  // fetchLogin
  describe("fetchLogin", () => {
    const loginData = { email: "test@test.com", password: "123456" };

    it("fulfilled: вызывает loginUser и сохраняет пользователя", async () => {
      const response: TLoginUserResponse = {
        status: true,
        access_token: "token-123",
        user: mockUser,
      };
      mockedAuthApi.loginUser.mockResolvedValue(response);

      const store = createTestStore();
      await store.dispatch(fetchLogin(loginData));

      expect(mockedAuthApi.loginUser).toHaveBeenCalledWith(loginData);
      expect(store.getState().auth.currentUser).toEqual(mockUser);
    });

    it("rejected: ошибка API → rejectWithValue", async () => {
      mockedAuthApi.loginUser.mockRejectedValue("Invalid creds");

      const store = createTestStore();
      const result = await store.dispatch(fetchLogin(loginData));

      expect(result.meta.requestStatus).toBe("rejected");
    });
  });

  // fetchCheckUser
  describe("fetchCheckUser", () => {
    const checkData = { email: "test@test.com", password: "123456" };

    it("fulfilled: вызывает checkUser", async () => {
      mockedAuthApi.checkUser.mockResolvedValue(undefined);

      const store = createTestStore();
      const result = await store.dispatch(fetchCheckUser(checkData));

      expect(mockedAuthApi.checkUser).toHaveBeenCalledWith(checkData);
      expect(result.meta.requestStatus).toBe("fulfilled");
      expect(store.getState().auth.checkUserLoading).toBe(false);
      expect(store.getState().auth.checkUserError).toBeNull();
    });

    it("rejected: ошибка → rejectWithValue → checkUserError", async () => {
      mockedAuthApi.checkUser.mockRejectedValue("User not found");

      const store = createTestStore();
      const result = await store.dispatch(fetchCheckUser(checkData));

      expect(result.meta.requestStatus).toBe("rejected");
    });
  });

  // fetchProfile
  describe("fetchProfile", () => {
    it("fulfilled: при наличии токена загружает профиль", async () => {
      (tokenService.get as jest.Mock).mockReturnValue("valid-token");
      mockedAuthApi.getProfile.mockResolvedValue(mockUser);

      const store = createTestStore();
      await store.dispatch(fetchProfile());

      expect(mockedAuthApi.getProfile).toHaveBeenCalled();
      expect(store.getState().auth.currentUser).toEqual(mockUser);
    });

    it('rejected: без токена → rejectWithValue "Токен не найден"', async () => {
      (tokenService.get as jest.Mock).mockReturnValue(null);

      const store = createTestStore();
      const result = await store.dispatch(fetchProfile());

      expect(result.meta.requestStatus).toBe("rejected");
      expect(result.payload).toBe("Токен не найден");
      expect(mockedAuthApi.getProfile).not.toHaveBeenCalled();
    });

    it("rejected: ошибка API", async () => {
      (tokenService.get as jest.Mock).mockReturnValue("valid-token");
      mockedAuthApi.getProfile.mockRejectedValue("Server error");

      const store = createTestStore();
      const result = await store.dispatch(fetchProfile());

      expect(result.meta.requestStatus).toBe("rejected");
    });
  });

  // fetchUpdateCurrentUser
  describe("fetchUpdateCurrentUser", () => {
    const updatePayload = { name: "New Name" };

    it("fulfilled: обновляет пользователя", async () => {
      const updatedUser = { ...mockUser, name: "New Name" };
      (tokenService.get as jest.Mock).mockReturnValue("valid-token");
      mockedUserApi.updateUser.mockResolvedValue(updatedUser);

      const store = createTestStore({ currentUser: mockUser });
      await store.dispatch(fetchUpdateCurrentUser(updatePayload));

      expect(mockedUserApi.updateUser).toHaveBeenCalledWith(
        "user-1",
        updatePayload,
        "valid-token",
      );
      expect(store.getState().auth.currentUser).toEqual(updatedUser);
    });

    it("rejected: без токена → rejectWithValue", async () => {
      (tokenService.get as jest.Mock).mockReturnValue(null);

      const store = createTestStore({ currentUser: mockUser });
      const result = await store.dispatch(
        fetchUpdateCurrentUser(updatePayload),
      );

      expect(result.meta.requestStatus).toBe("rejected");
      expect(result.payload).toBe("Токен не найден");
    });

    it("rejected: без currentUser.id → rejectWithValue", async () => {
      (tokenService.get as jest.Mock).mockReturnValue("valid-token");
      const userWithoutId = { ...mockUser, id: undefined };

      const store = createTestStore({ currentUser: userWithoutId });
      const result = await store.dispatch(
        fetchUpdateCurrentUser(updatePayload),
      );

      expect(result.meta.requestStatus).toBe("rejected");
      expect(result.payload).toBe("Не найден id пользователя");
    });

    it("rejected: ошибка API", async () => {
      (tokenService.get as jest.Mock).mockReturnValue("valid-token");
      mockedUserApi.updateUser.mockRejectedValue("Update failed");

      const store = createTestStore({ currentUser: mockUser });
      const result = await store.dispatch(
        fetchUpdateCurrentUser(updatePayload),
      );

      expect(result.meta.requestStatus).toBe("rejected");
    });
  });
});
