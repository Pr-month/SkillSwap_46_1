import { USE_MOCKS } from "../config/apiConfig";
import type {
  IMyRequests,
  ISkillExchange,
  ISkillExchangeData,
  TId,
  TRequestStatus,
} from "../utils/types";
import { tokenService } from "../utils/tokenService.ts";
import { request } from "./client";

interface ApiResponse<T> {
  status: boolean;
  data: T;
}

interface ApiRequest {
  id: TId;
  createdAt: string;
  status: TRequestStatus;
  isRead: boolean;
  sender: {
    id: TId;
  };
  receiver: {
    id: TId;
  };
  offeredSkill: {
    id: TId;
  };
  requestedSkill: {
    id: TId;
  };
}

const mapApiRequest = (apiRequest: ApiRequest): ISkillExchange => ({
  id: apiRequest.id,
  userSkill: apiRequest.offeredSkill.id,
  requiredSkillUserId: apiRequest.receiver.id,
  createdAt: apiRequest.createdAt,
  status: apiRequest.status,
  fromUserId: apiRequest.sender.id,
  toUserId: apiRequest.receiver.id,
});

//POST
export const createRequest = (
  data: ISkillExchangeData,
): Promise<ISkillExchange> => {
  const token = tokenService.get();

  if (USE_MOCKS) {
    return fetch("/request-single.json")
      .then((response) => response.json())
      .then((response) => ({
        ...response.data,
        userSkill: data.offeredSkillId,
        status: "pending" as const,
        fromUserId: "user-1",
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      }));
  }

  return request<ApiResponse<ApiRequest>>("/requests", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(data),
  }).then((res) => mapApiRequest(res.data));
};

//GET my
export const getMyRequests = async (): Promise<IMyRequests> => {
  const token = tokenService.get();

  if (USE_MOCKS) {
    return fetch("/requests.json")
      .then((r) => r.json())
      .then((res) => res.data);
  }

  const [incoming, outgoing] = await Promise.all([
    request<ApiResponse<ApiRequest[]>>("/requests/incoming", {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }).then((res) => res.data.map(mapApiRequest)),

    request<ApiResponse<ApiRequest[]>>("/requests/outgoing", {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }).then((res) => res.data.map(mapApiRequest)),
  ]);

  return {
    sent: outgoing,
    received: incoming,
  };
};

//GET by id
export const getRequestById = (id: TId): Promise<ISkillExchange> => {
  const token = tokenService.get();
  if (USE_MOCKS) {
    return fetch("/request-single.json")
      .then((r) => r.json())
      .then((res) => res.data);
  }
  return request<ApiResponse<ApiRequest>>(`/requests/${id}`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  }).then((res) => mapApiRequest(res.data));
};

//PATCH status
export const updateRequestStatus = (
  id: TId,
  status: TRequestStatus,
): Promise<ISkillExchange> => {
  const token = tokenService.get();
  if (USE_MOCKS) {
    return fetch("/request-single.json")
      .then((r) => r.json())
      .then((res) => ({
        ...res.data,
        status,
        updatedAt: new Date().toISOString(),
      }));
  }
  return request<ApiResponse<ApiRequest>>(`/requests/${id}`, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ status }),
  }).then((res) => mapApiRequest(res.data));
};

//PATCH complete
export const completeRequest = (id: TId): Promise<ISkillExchange> => {
  const token = tokenService.get();
  if (USE_MOCKS) {
    return fetch("/request-single.json")
      .then((r) => r.json())
      .then((res) => ({
        ...res.data,
        status: "done",
        updatedAt: new Date().toISOString(),
      }));
  }

  return request<ApiResponse<ApiRequest>>(`/requests/${id}`, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ status: "done" }),
  }).then((res) => mapApiRequest(res.data));
};
