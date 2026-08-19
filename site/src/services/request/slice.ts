import { createSlice } from "@reduxjs/toolkit";
import type { ISkillExchange } from "../../utils/types";

import {
  createRequestAction,
  fetchMyRequests,
  fetchRequestById,
  updateRequestStatusAction,
  completeRequestAction,
} from "./actions";

interface RequestState {
  sent: ISkillExchange[];
  received: ISkillExchange[];
  selectedRequest: ISkillExchange | null;
  loading: boolean;
  error: string | null;
}

const initialState: RequestState = {
  sent: [],
  received: [],
  selectedRequest: null,
  loading: false,
  error: null,
};

const handlePending = (state: RequestState) => {
  state.loading = true;
  state.error = null;
};

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const handleRejected = (state: RequestState, action: any) => {
  state.loading = false;
  state.error = action.error?.message || "Ошибка запроса";
};

export const requestSlice = createSlice({
  name: "requests",
  initialState,
  reducers: {
    clearSelectedRequest(state) {
      state.selectedRequest = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // CREATE
      .addCase(createRequestAction.pending, handlePending)
      .addCase(createRequestAction.fulfilled, (state, action) => {
        state.loading = false;
        state.sent.unshift(action.payload);
      })
      .addCase(createRequestAction.rejected, handleRejected)

      //GET MY
      .addCase(fetchMyRequests.pending, handlePending)
      .addCase(fetchMyRequests.fulfilled, (state, action) => {
        state.loading = false;
        state.sent = action.payload.sent;
        state.received = action.payload.received;
      })
      .addCase(fetchMyRequests.rejected, handleRejected)

      // GET BY ID
      .addCase(fetchRequestById.pending, handlePending)
      .addCase(fetchRequestById.fulfilled, (state, action) => {
        state.loading = false;
        state.selectedRequest = action.payload;
      })
      .addCase(fetchRequestById.rejected, handleRejected)

      // UPDATE STATUS
      .addCase(updateRequestStatusAction.pending, handlePending)
      .addCase(updateRequestStatusAction.fulfilled, (state, action) => {
        state.loading = false;

        const updated = action.payload;

        // обновляем в sent
        state.sent = state.sent.map((r) => (r.id === updated.id ? updated : r));

        // обновляем в received
        state.received = state.received.map((r) =>
          r.id === updated.id ? updated : r,
        );

        // если это выбранный
        if (state.selectedRequest?.id === updated.id) {
          state.selectedRequest = updated;
        }
      })
      .addCase(updateRequestStatusAction.rejected, handleRejected)

      //COMPLETE
      .addCase(completeRequestAction.pending, handlePending)
      .addCase(completeRequestAction.fulfilled, (state, action) => {
        state.loading = false;

        const updated = action.payload;

        state.sent = state.sent.map((r) => (r.id === updated.id ? updated : r));

        state.received = state.received.map((r) =>
          r.id === updated.id ? updated : r,
        );

        if (state.selectedRequest?.id === updated.id) {
          state.selectedRequest = updated;
        }
      })
      .addCase(completeRequestAction.rejected, handleRejected);
  },
});

export const { clearSelectedRequest } = requestSlice.actions;
export default requestSlice.reducer;
