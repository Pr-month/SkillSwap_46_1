import { describe, expect, it } from "@jest/globals";
import userReducer, { clearSelectedUser } from "./slice";
import { fetchUsers, fetchUserById, removeUser } from "./actions";
import type { IUserProfile } from "../../utils/types";

const mockUser1: IUserProfile = {
  id: "user-1",
  email: "alice@test.com",
  name: "Alice",
  birthDate: "1995-01-01",
  gender: "female",
  city: "Moscow",
  avatar: "a1.png",
  likesSkillsIds: [],
  userSkill: "skill-1",
  interestedSkillsSubcategoriesIds: [],
  createdAt: "2024-01-01T00:00:00.000Z",
  updatedAt: "2024-01-01T00:00:00.000Z",
};

const mockUser2: IUserProfile = {
  id: "user-2",
  email: "bob@test.com",
  name: "Bob",
  birthDate: "1990-05-15",
  gender: "male",
  city: "SPb",
  avatar: "a2.png",
  likesSkillsIds: [],
  userSkill: "skill-2",
  interestedSkillsSubcategoriesIds: [],
  createdAt: "2024-06-01T00:00:00.000Z",
  updatedAt: "2024-06-01T00:00:00.000Z",
};

interface UserState {
  list: IUserProfile[];
  selectedUser: IUserProfile | null;
  loading: boolean;
  error: string | null;
  page: number;
  totalPages: number;
  hasMore: boolean;
}

const initialState: UserState = {
  list: [],
  selectedUser: null,
  loading: false,
  error: null,
  page: 0,
  totalPages: 0,
  hasMore: false,
};

describe("userSlice", () => {
  //Initial
  it("должен вернуть начальное состояние", () => {
    const state = userReducer(undefined, { type: "@@INIT" });
    expect(state).toEqual(initialState);
  });

  //clearSelectedUser
  describe("clearSelectedUser", () => {
    it("должен сбросить selectedUser в null", () => {
      const stateWithUser: UserState = {
        ...initialState,
        selectedUser: mockUser1,
      };
      const state = userReducer(stateWithUser, clearSelectedUser());
      expect(state.selectedUser).toBeNull();
    });
  });

  //fetchUsers
  describe("fetchUsers", () => {
    it("pending: loading=true, error=null", () => {
      const state = userReducer(
        { ...initialState, error: "old error" },
        fetchUsers.pending("", { page: 1, limit: 20 }),
      );
      expect(state.loading).toBe(true);
      expect(state.error).toBeNull();
    });

    it("fulfilled: loading=false, list заполнен (первая страница)", () => {
      const state = userReducer(
        { ...initialState, loading: true },
        fetchUsers.fulfilled(
          { data: [mockUser1, mockUser2], page: 1, totalPages: 2 },
          "",
          { page: 1, limit: 20 },
        ),
      );
      expect(state.loading).toBe(false);
      expect(state.list).toEqual([mockUser1, mockUser2]);
      expect(state.page).toBe(1);
      expect(state.totalPages).toBe(2);
      expect(state.hasMore).toBe(true);
    });

    it("fulfilled: дополняет list на последующих страницах без дублей", () => {
      const state = userReducer(
        { ...initialState, list: [mockUser1], page: 1, totalPages: 2 },
        fetchUsers.fulfilled(
          { data: [mockUser1, mockUser2], page: 2, totalPages: 2 },
          "",
          { page: 2, limit: 20 },
        ),
      );
      expect(state.list).toEqual([mockUser1, mockUser2]);
      expect(state.page).toBe(2);
      expect(state.hasMore).toBe(false);
    });

    it("rejected: loading=false, error заполнен", () => {
      const action = {
        type: fetchUsers.rejected.type,
        error: { message: "Fetch failed" },
      };
      const state = userReducer({ ...initialState, loading: true }, action);
      expect(state.loading).toBe(false);
      expect(state.error).toBe("Fetch failed");
    });

    it("rejected без message: fallback текст", () => {
      const action = {
        type: fetchUsers.rejected.type,
        error: {},
      };
      const state = userReducer({ ...initialState, loading: true }, action);
      expect(state.error).toBe("Ошибка запроса пользователей");
    });
  });

  //fetchUserById
  describe("fetchUserById", () => {
    it("pending: loading=true, error=null", () => {
      const state = userReducer(
        initialState,
        fetchUserById.pending("", "user-1"),
      );
      expect(state.loading).toBe(true);
      expect(state.error).toBeNull();
    });

    it("fulfilled: loading=false, selectedUser заполнен", () => {
      const state = userReducer(
        { ...initialState, loading: true },
        fetchUserById.fulfilled(mockUser1, "", "user-1"),
      );
      expect(state.loading).toBe(false);
      expect(state.selectedUser).toEqual(mockUser1);
    });

    it("rejected: loading=false, error заполнен", () => {
      const action = {
        type: fetchUserById.rejected.type,
        error: { message: "User not found" },
      };
      const state = userReducer({ ...initialState, loading: true }, action);
      expect(state.loading).toBe(false);
      expect(state.error).toBe("User not found");
    });
  });

  //removeUser
  describe("removeUser", () => {
    it("fulfilled: удаляет пользователя из list", () => {
      const stateWithUsers: UserState = {
        ...initialState,
        list: [mockUser1, mockUser2],
      };
      const state = userReducer(
        stateWithUsers,
        removeUser.fulfilled("user-1", "", { id: "user-1", token: "tok" }),
      );
      expect(state.list).toEqual([mockUser2]);
    });

    it("fulfilled: сбрасывает selectedUser если удалён он", () => {
      const stateWithSelected: UserState = {
        ...initialState,
        list: [mockUser1, mockUser2],
        selectedUser: mockUser1,
      };
      const state = userReducer(
        stateWithSelected,
        removeUser.fulfilled("user-1", "", { id: "user-1", token: "tok" }),
      );
      expect(state.selectedUser).toBeNull();
    });

    it("fulfilled: не сбрасывает selectedUser если удалён другой", () => {
      const stateWithSelected: UserState = {
        ...initialState,
        list: [mockUser1, mockUser2],
        selectedUser: mockUser1,
      };
      const state = userReducer(
        stateWithSelected,
        removeUser.fulfilled("user-2", "", { id: "user-2", token: "tok" }),
      );
      expect(state.selectedUser).toEqual(mockUser1);
    });

    it("rejected: loading=false, error заполнен", () => {
      const action = {
        type: removeUser.rejected.type,
        error: { message: "Delete failed" },
      };
      const state = userReducer({ ...initialState, loading: true }, action);
      expect(state.loading).toBe(false);
      expect(state.error).toBe("Delete failed");
    });
  });
});
