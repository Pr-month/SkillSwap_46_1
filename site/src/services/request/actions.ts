import { createAsyncThunk } from "@reduxjs/toolkit";
import type {
  ISkillExchange,
  ISkillExchangeData,
  IMyRequests,
  TId,
  TRequestStatus,
} from "../../utils/types";

import {
  createRequest,
  getMyRequests,
  getRequestById,
  updateRequestStatus,
  completeRequest,
} from "../../api/requestApi";

// CREATE
export const createRequestAction = createAsyncThunk<
  ISkillExchange,
  ISkillExchangeData
>("requests/create", async (data, { rejectWithValue }) => {
  try {
    return await createRequest(data);
  } catch (err) {
    return rejectWithValue(err);
  }
});

// GET MY REQUESTS
export const fetchMyRequests = createAsyncThunk<IMyRequests, void>(
  "requests/getMy",
  async (_, { rejectWithValue }) => {
    try {
      return await getMyRequests();
    } catch (err) {
      return rejectWithValue(err);
    }
  },
);

// GET BY ID
export const fetchRequestById = createAsyncThunk<ISkillExchange, TId>(
  "requests/getById",
  async (id, { rejectWithValue }) => {
    try {
      return await getRequestById(id);
    } catch (err) {
      return rejectWithValue(err);
    }
  },
);

// UPDATE STATUS
export const updateRequestStatusAction = createAsyncThunk<
  ISkillExchange,
  { id: TId; status: TRequestStatus }
>("requests/updateStatus", async ({ id, status }, { rejectWithValue }) => {
  try {
    return await updateRequestStatus(id, status);
  } catch (err) {
    return rejectWithValue(err);
  }
});

// COMPLETE
export const completeRequestAction = createAsyncThunk<ISkillExchange, TId>(
  "requests/complete",
  async (id, { rejectWithValue }) => {
    try {
      return await completeRequest(id);
    } catch (err) {
      return rejectWithValue(err);
    }
  },
);
