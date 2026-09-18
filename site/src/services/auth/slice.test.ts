import { describe, expect, it } from "@jest/globals";
import authReducer, { logout } from "./slice";
import type { AuthState } from "./types";
import {
  fetchRegister,
  fetchLogin,
  fetchProfile,
  fetchUpdateCurrentUser,
  fetchCheckUser,
} from "./actions";
import type { IUserProfile } from "../../utils/types";

const mockUser: IUserProfile = {
  id: "user-1",
  email: "test@test.com",
  name: "Test User",
  birthDate: "2000-01-01",
  gender: "MALE",
  city: "Moscow",
  avatar: "avatar.png",
  likesSkillsIds: [],
  userSkill: "",
  interestedSkillsSubcategoriesIds: [],
  createdAt: "2024-01-01T00:00:00.000Z",
  updatedAt: "2024-01-01T00:00:00.000Z",
};

const initialState: AuthState = {
  currentUser: null,
  loading: false,
  error: null,
  checkUserLoading: false,
  checkUserError: null,
};

describe("authSlice", () => {
  it("должен вернуть начальное состояние", () => {
    const state = authReducer(undefined, { type: "@@INIT" });
    expect(state).toEqual(initialState);
  });

  // logout
  describe("logout", () => {
    it("должен сбросить currentUser", () => {
      const stateWithUser: AuthState = {
        ...initialState,
        currentUser: mockUser,
      };

      const state = authReducer(stateWithUser, logout());

      expect(state.currentUser).toBeNull();
    });
  });

  // fetchRegister
  describe("fetchRegister", () => {
    it("pending: loading=true, error=null", () => {
      const state = authReducer(
        { ...initialState, error: "old error" },
        fetchRegister.pending("", {} as never),
      );
      expect(state.loading).toBe(true);
      expect(state.error).toBeNull();
    });

    it("fulfilled: loading=false, currentUser из payload.user", () => {
      const payload = { status: true, user: mockUser };
      const state = authReducer(
        { ...initialState, loading: true },
        fetchRegister.fulfilled(payload as never, "", {} as never),
      );
      expect(state.loading).toBe(false);
      expect(state.currentUser).toEqual(mockUser);
    });

    it("rejected: loading=false, error заполнен", () => {
      const action = {
        type: fetchRegister.rejected.type,
        error: { message: "Registration failed" },
      };
      const state = authReducer({ ...initialState, loading: true }, action);
      expect(state.loading).toBe(false);
      expect(state.error).toBe("Registration failed");
    });

    it("rejected без message: fallback текст", () => {
      const action = {
        type: fetchRegister.rejected.type,
        error: {},
      };
      const state = authReducer({ ...initialState, loading: true }, action);
      expect(state.error).toBe("Ошибка запроса");
    });
  });

  // fetchLogin
  describe("fetchLogin", () => {
    it("pending: loading=true, error=null", () => {
      const state = authReducer(
        initialState,
        fetchLogin.pending("", {} as never),
      );
      expect(state.loading).toBe(true);
      expect(state.error).toBeNull();
    });

    it("fulfilled: loading=false, currentUser из payload.data", () => {
      const payload = { status: true, data: mockUser };
      const state = authReducer(
        { ...initialState, loading: true },
        fetchLogin.fulfilled(payload as never, "", {} as never),
      );
      expect(state.loading).toBe(false);
      expect(state.currentUser).toEqual(mockUser);
    });

    it("rejected: loading=false, error заполнен", () => {
      const action = {
        type: fetchLogin.rejected.type,
        error: { message: "Login failed" },
      };
      const state = authReducer({ ...initialState, loading: true }, action);
      expect(state.loading).toBe(false);
      expect(state.error).toBe("Login failed");
    });
  });

  // fetchProfile
  describe("fetchProfile", () => {
    it("pending: loading=true", () => {
      const state = authReducer(
        initialState,
        fetchProfile.pending("", undefined),
      );
      expect(state.loading).toBe(true);
    });

    it("fulfilled: currentUser = payload напрямую", () => {
      const state = authReducer(
        { ...initialState, loading: true },
        fetchProfile.fulfilled(mockUser, "", undefined),
      );
      expect(state.loading).toBe(false);
      expect(state.currentUser).toEqual(mockUser);
    });

    it("rejected: loading=false, error заполнен", () => {
      const action = {
        type: fetchProfile.rejected.type,
        error: { message: "Profile error" },
      };
      const state = authReducer({ ...initialState, loading: true }, action);
      expect(state.loading).toBe(false);
      expect(state.error).toBe("Profile error");
    });
  });

  // fetchUpdateCurrentUser
  describe("fetchUpdateCurrentUser", () => {
    it("pending: loading=true", () => {
      const state = authReducer(
        initialState,
        fetchUpdateCurrentUser.pending("", {} as never),
      );
      expect(state.loading).toBe(true);
    });

    it("fulfilled: currentUser обновлён", () => {
      const updatedUser = { ...mockUser, name: "Updated Name" };
      const state = authReducer(
        { ...initialState, loading: true, currentUser: mockUser },
        fetchUpdateCurrentUser.fulfilled(updatedUser, "", {} as never),
      );
      expect(state.loading).toBe(false);
      expect(state.currentUser).toEqual(updatedUser);
    });

    it("rejected: loading=false, error заполнен", () => {
      const action = {
        type: fetchUpdateCurrentUser.rejected.type,
        error: { message: "Update failed" },
      };
      const state = authReducer({ ...initialState, loading: true }, action);
      expect(state.loading).toBe(false);
      expect(state.error).toBe("Update failed");
    });
  });

  // fetchCheckUser
  describe("fetchCheckUser", () => {
    it("pending: checkUserLoading=true, checkUserError=null", () => {
      const state = authReducer(
        { ...initialState, checkUserError: "old" },
        fetchCheckUser.pending("", {} as never),
      );
      expect(state.checkUserLoading).toBe(true);
      expect(state.checkUserError).toBeNull();
    });

    it("fulfilled: checkUserLoading=false, checkUserError=null", () => {
      const state = authReducer(
        { ...initialState, checkUserLoading: true },
        fetchCheckUser.fulfilled(undefined, "", {} as never),
      );
      expect(state.checkUserLoading).toBe(false);
      expect(state.checkUserError).toBeNull();
    });

    it("rejected: checkUserLoading=false, checkUserError из payload", () => {
      const action = {
        type: fetchCheckUser.rejected.type,
        payload: "User not found",
      };
      const state = authReducer(
        { ...initialState, checkUserLoading: true },
        action,
      );
      expect(state.checkUserLoading).toBe(false);
      expect(state.checkUserError).toBe("User not found");
    });
  });
});
