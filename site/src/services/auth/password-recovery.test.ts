import { beforeEach, describe, expect, jest, it } from "@jest/globals";
import { configureStore } from "@reduxjs/toolkit";
import { fetchForgotPassword, fetchResetPassword } from "./actions";
import * as authApi from "../../api/authApi";

jest.mock("../../api/authApi");

const mockedAuthApi = authApi as jest.Mocked<typeof authApi>;

const createTestStore = () =>
  configureStore({
    reducer: (state = {}) => state,
    middleware: (getDefaultMiddleware) =>
      getDefaultMiddleware({ serializableCheck: false }),
  });

describe("password-recovery thunks", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("fetchForgotPassword", () => {
    it("fulfilled: вызывает forgotPassword и завершается успешно", async () => {
      mockedAuthApi.forgotPassword.mockResolvedValue(undefined);

      const store = createTestStore();
      const result = await store.dispatch(
        fetchForgotPassword("test@test.com"),
      );

      expect(mockedAuthApi.forgotPassword).toHaveBeenCalledWith(
        "test@test.com",
      );
      expect(result.meta.requestStatus).toBe("fulfilled");
    });

    it("rejected: ошибка API → rejectWithValue", async () => {
      mockedAuthApi.forgotPassword.mockRejectedValue("Send failed");

      const store = createTestStore();
      const result = await store.dispatch(
        fetchForgotPassword("test@test.com"),
      );

      expect(result.meta.requestStatus).toBe("rejected");
    });
  });

  describe("fetchResetPassword", () => {
    it("fulfilled: вызывает resetPassword и завершается успешно", async () => {
      mockedAuthApi.resetPassword.mockResolvedValue(undefined);

      const store = createTestStore();
      const result = await store.dispatch(
        fetchResetPassword({ token: "token-123", newPassword: "new-pass" }),
      );

      expect(mockedAuthApi.resetPassword).toHaveBeenCalledWith(
        "token-123",
        "new-pass",
      );
      expect(result.meta.requestStatus).toBe("fulfilled");
    });

    it("rejected: ошибка API → rejectWithValue", async () => {
      mockedAuthApi.resetPassword.mockRejectedValue("Reset failed");

      const store = createTestStore();
      const result = await store.dispatch(
        fetchResetPassword({ token: "token-123", newPassword: "new-pass" }),
      );

      expect(result.meta.requestStatus).toBe("rejected");
    });
  });
});
