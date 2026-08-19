import { describe, test, expect } from "@jest/globals";
import { requestSlice, clearSelectedRequest } from "./slice";

import {
  createRequestAction,
  fetchMyRequests,
  fetchRequestById,
  updateRequestStatusAction,
  completeRequestAction,
} from "./actions";

import type {
  ISkillExchange,
  ISkillExchangeData,
  IMyRequests,
} from "../../utils/types";

const reducer = requestSlice.reducer;

describe("requestSlice reducer", () => {
  const request1: ISkillExchange = {
    id: "1",
    userSkill: "skill1",
    requiredSkillUserId: "user2",
    message: "msg",
    createdAt: "date",
    status: "pending",
  };

  const request2: ISkillExchange = {
    id: "2",
    userSkill: "skill2",
    requiredSkillUserId: "user3",
    message: "msg2",
    createdAt: "date",
    status: "accepted",
  };

  const requestData: ISkillExchangeData = {
    userSkill: "skill1",
    requiredSkillUserId: "user2",
    message: "msg",
  };

  test("очищает selectedRequest (clearSelectedRequest)", () => {
    const state = {
      ...requestSlice.getInitialState(),
      selectedRequest: request1,
    };

    const newState = reducer(state, clearSelectedRequest());
    expect(newState.selectedRequest).toBeNull();
  });

  test("pending: createRequestAction", () => {
    const state = requestSlice.getInitialState();

    const newState = reducer(
      state,
      createRequestAction.pending("", requestData),
    );

    expect(newState.loading).toBe(true);
    expect(newState.error).toBeNull();
  });

  test("fulfilled: createRequestAction", () => {
    const state = requestSlice.getInitialState();

    const newState = reducer(
      state,
      createRequestAction.fulfilled(request1, "", requestData),
    );

    expect(newState.loading).toBe(false);
    expect(newState.sent[0]).toEqual(request1);
  });

  test("rejected: createRequestAction", () => {
    const state = requestSlice.getInitialState();
    const error = new Error("Create error");

    const newState = reducer(
      state,
      createRequestAction.rejected(error, "", requestData),
    );

    expect(newState.loading).toBe(false);
    expect(newState.error).toBe("Create error");
  });

  test("pending: fetchMyRequests", () => {
    const state = requestSlice.getInitialState();

    const newState = reducer(state, fetchMyRequests.pending("", undefined));

    expect(newState.loading).toBe(true);
    expect(newState.error).toBeNull();
  });

  test("fulfilled: fetchMyRequests", () => {
    const state = requestSlice.getInitialState();

    const payload: IMyRequests = {
      sent: [request1],
      received: [request2],
    };

    const newState = reducer(
      state,
      fetchMyRequests.fulfilled(payload, "", undefined),
    );

    expect(newState.loading).toBe(false);
    expect(newState.sent).toEqual([request1]);
    expect(newState.received).toEqual([request2]);
  });

  test("rejected: fetchMyRequests", () => {
    const state = requestSlice.getInitialState();
    const error = new Error("Fetch error");

    const newState = reducer(
      state,
      fetchMyRequests.rejected(error, "", undefined),
    );

    expect(newState.loading).toBe(false);
    expect(newState.error).toBe("Fetch error");
  });

  test("pending: fetchRequestById", () => {
    const state = requestSlice.getInitialState();

    const newState = reducer(state, fetchRequestById.pending("", "1"));

    expect(newState.loading).toBe(true);
  });

  test("fulfilled: fetchRequestById", () => {
    const state = requestSlice.getInitialState();

    const newState = reducer(
      state,
      fetchRequestById.fulfilled(request1, "", "1"),
    );

    expect(newState.loading).toBe(false);
    expect(newState.selectedRequest).toEqual(request1);
  });

  test("rejected: fetchRequestById", () => {
    const state = requestSlice.getInitialState();
    const error = new Error("Get by id error");

    const newState = reducer(state, fetchRequestById.rejected(error, "", "1"));

    expect(newState.loading).toBe(false);
    expect(newState.error).toBe("Get by id error");
  });

  test("fulfilled: updateRequestStatusAction", () => {
    const state = {
      ...requestSlice.getInitialState(),
      sent: [request1],
      received: [request1],
      selectedRequest: request1,
    };

    const updated: ISkillExchange = {
      ...request1,
      status: "accepted",
    };

    const newState = reducer(
      state,
      updateRequestStatusAction.fulfilled(updated, "", {
        id: "1",
        status: "accepted",
      }),
    );

    expect(newState.sent[0].status).toBe("accepted");
    expect(newState.received[0].status).toBe("accepted");
    expect(newState.selectedRequest?.status).toBe("accepted");
  });
  test("updateRequestStatusAction ничего не меняет если id не найден", () => {
    const state = {
      ...requestSlice.getInitialState(),
      sent: [request1],
      received: [request1],
    };

    const updated: ISkillExchange = {
      ...request1,
      id: "999",
      status: "accepted",
    };

    const newState = reducer(
      state,
      updateRequestStatusAction.fulfilled(updated, "", {
        id: "999",
        status: "accepted",
      }),
    );

    expect(newState.sent).toEqual([request1]);
    expect(newState.received).toEqual([request1]);
  });
  test("updateRequestStatusAction не трогает selectedRequest если id не совпадает", () => {
    const state = {
      ...requestSlice.getInitialState(),
      selectedRequest: request1,
    };

    const updated: ISkillExchange = {
      ...request2,
      status: "done",
    };

    const newState = reducer(
      state,
      updateRequestStatusAction.fulfilled(updated, "", {
        id: request2.id,
        status: "done",
      }),
    );

    expect(newState.selectedRequest).toEqual(request1);
  });

  test("rejected: updateRequestStatusAction", () => {
    const state = requestSlice.getInitialState();
    const error = new Error("Update error");

    const newState = reducer(
      state,
      updateRequestStatusAction.rejected(error, "", {
        id: "1",
        status: "accepted",
      }),
    );

    expect(newState.loading).toBe(false);
    expect(newState.error).toBe("Update error");
  });

  test("fulfilled: completeRequestAction", () => {
    const state = {
      ...requestSlice.getInitialState(),
      sent: [request1],
      received: [request1],
      selectedRequest: request1,
    };

    const updated: ISkillExchange = {
      ...request1,
      status: "done",
    };

    const newState = reducer(
      state,
      completeRequestAction.fulfilled(updated, "", "1"),
    );

    expect(newState.sent[0].status).toBe("done");
    expect(newState.received[0].status).toBe("done");
    expect(newState.selectedRequest?.status).toBe("done");
  });

  test("rejected: completeRequestAction", () => {
    const state = requestSlice.getInitialState();
    const error = new Error("Complete error");

    const newState = reducer(
      state,
      completeRequestAction.rejected(error, "", "1"),
    );

    expect(newState.loading).toBe(false);
    expect(newState.error).toBe("Complete error");
  });

  test("fallback error сообщение", () => {
    const state = requestSlice.getInitialState();

    const newState = reducer(
      state,
      fetchMyRequests.rejected({} as any, "", undefined),
    );

    expect(newState.error).toBe("Ошибка запроса");
  });
});
