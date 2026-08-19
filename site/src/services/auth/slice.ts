import { createSlice } from "@reduxjs/toolkit";
import { tokenService } from "../../utils/tokenService.ts";
import {
  fetchCheckUser,
  fetchLogin,
  fetchProfile,
  fetchRegister,
  fetchUpdateCurrentUser,
  updatePassword,
} from "./actions.ts";
import type { AuthState } from "./types.ts";

const initialState: AuthState = {
  currentUser: null,
  loading: false,
  error: null,
  checkUserLoading: false,
  checkUserError: null,
};

const handlePending = (state: AuthState) => {
  state.loading = true;
  state.error = null;
};

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const handleRejected = (state: AuthState, action: any) => {
  state.loading = false;
  state.error = action.error.message || "Ошибка запроса";
};

export const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    logout(state) {
      state.currentUser = null;
      tokenService.remove();
    },
  },
  extraReducers: (builder) => {
    // register
    builder
      .addCase(fetchRegister.pending, handlePending)
      .addCase(fetchRegister.fulfilled, (state, action) => {
        state.loading = false;
        state.currentUser = action.payload.user;
      })
      .addCase(fetchRegister.rejected, handleRejected)

      // login
      .addCase(fetchLogin.pending, handlePending)
      .addCase(fetchLogin.fulfilled, (state, action) => {
        state.loading = false;
        state.currentUser = action.payload.user;
      })
      .addCase(fetchLogin.rejected, handleRejected)

      // profile
      .addCase(fetchProfile.pending, handlePending)
      .addCase(fetchProfile.fulfilled, (state, action) => {
        state.loading = false;
        state.currentUser = action.payload;
      })
      .addCase(fetchProfile.rejected, handleRejected)

      // updateCurrentUser
      .addCase(fetchUpdateCurrentUser.pending, handlePending)
      .addCase(fetchUpdateCurrentUser.fulfilled, (state, action) => {
        state.loading = false;
        state.currentUser = action.payload;
      })
      .addCase(fetchUpdateCurrentUser.rejected, handleRejected);

    builder
      .addCase(fetchCheckUser.pending, (state) => {
        state.checkUserLoading = true;
        state.checkUserError = null;
      })
      .addCase(fetchCheckUser.fulfilled, (state) => {
        state.checkUserLoading = false;
        state.checkUserError = null;
      })
      .addCase(fetchCheckUser.rejected, (state, action) => {
        state.checkUserLoading = false;
        state.checkUserError = action.payload;
      })

      // ИЗМЕНЕНИЕ ПАРОЛЯ
      .addCase(updatePassword.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updatePassword.fulfilled, (state) => {
        state.loading = false;
        state.error = null;
      })
      .addCase(updatePassword.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.code || "Ошибка изменения пароля";
      });
  },
});

export const { logout } = authSlice.actions;
export default authSlice.reducer;
