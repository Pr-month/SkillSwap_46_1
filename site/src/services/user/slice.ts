import { createSlice } from "@reduxjs/toolkit";
import type { IUserProfile } from "../../utils/types.ts";
import { fetchUsers, fetchUserById, removeUser } from "./actions.ts";

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

const handlePending = (state: UserState) => {
  state.loading = true;
  state.error = null;
};

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const handleRejected = (state: UserState, action: any) => {
  state.loading = false;
  state.error = action.error.message || "Ошибка запроса пользователей";
};

export const userSlice = createSlice({
  name: "user",
  initialState,
  reducers: {
    clearSelectedUser(state) {
      state.selectedUser = null;
    },
    updateUserLikes: (state, action) => {
      const { userId, likesSkillsIds } = action.payload;
      const user = state.list.find((u) => u.id === userId);
      if (user) {
        user.likesSkillsIds = likesSkillsIds;
      }
      if (state.selectedUser && state.selectedUser?.id === userId) {
        state.selectedUser.likesSkillsIds = likesSkillsIds;
      }
    },
  },
  extraReducers: (builder) => {
    builder
      // fetchUsers
      .addCase(fetchUsers.pending, handlePending)
      .addCase(fetchUsers.fulfilled, (state, action) => {
        state.loading = false;
        state.error = null;

        const { data, page, totalPages } = action.payload;

        if (page <= 1) {
          state.list = data;
        } else {
          const existingIds = new Set(state.list.map((user) => user.id));
          const newUsers = data.filter((user) => !existingIds.has(user.id));
          state.list = state.list.concat(newUsers);
        }

        state.page = page;
        state.totalPages = totalPages;
        state.hasMore = page < totalPages;
      })
      .addCase(fetchUsers.rejected, handleRejected)
      // fetchUserById
      .addCase(fetchUserById.pending, handlePending)
      .addCase(fetchUserById.fulfilled, (state, action) => {
        state.loading = false;
        state.selectedUser = action.payload;
      })
      .addCase(fetchUserById.rejected, handleRejected)
      // removeUser
      .addCase(removeUser.fulfilled, (state, action) => {
        state.list = state.list.filter((u) => u.id !== action.payload);
        if (state.selectedUser?.id === action.payload) {
          state.selectedUser = null;
        }
      })
      .addCase(removeUser.rejected, handleRejected);
  },
});

export const { clearSelectedUser, updateUserLikes } = userSlice.actions;
export default userSlice.reducer;
