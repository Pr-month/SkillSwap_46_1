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

//POST create
export const createRequest = (
  data: ISkillExchangeData,
): Promise<ISkillExchange> => {
  const token = tokenService.get();

  if (USE_MOCKS) {
    return fetch("/request-single.json")
      .then((r) => r.json())
      .then((res) => ({
        ...res.data,
        ...data,
        status: "pending",
        fromUserId: "user-1",
        toUserId: data.requiredSkillUserId,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      }));
  }

  return request<ApiResponse<ISkillExchange>>("/requests", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(data),
  }).then((res: { status: boolean; data: ISkillExchange }) => res.data);
};

//GET my
export const getMyRequests = (): Promise<IMyRequests> => {
  const token = tokenService.get();

  if (USE_MOCKS) {
    return fetch("/requests.json")
      .then((r) => r.json())
      .then((res) => res.data);
  }

  return request<ApiResponse<IMyRequests>>("/requests/my", {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  }).then((res: { status: boolean; data: IMyRequests }) => res.data);
};

//GET by id
export const getRequestById = (id: TId): Promise<ISkillExchange> => {
  const token = tokenService.get();
  if (USE_MOCKS) {
    return fetch("/request-single.json")
      .then((r) => r.json())
      .then((res) => res.data);
  }
  return request<ApiResponse<ISkillExchange>>(`/requests/${id}`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  }).then((res: { status: boolean; data: ISkillExchange }) => res.data);
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
  return request<ApiResponse<ISkillExchange>>(`/requests/${id}/status`, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ status }),
  }).then((res: { status: boolean; data: ISkillExchange }) => res.data);
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

  return request<ApiResponse<ISkillExchange>>(`/requests/${id}/complete`, {
    method: "PATCH",
    headers: {
      Authorization: `Bearer ${token}`,
    },
  }).then((res: { status: boolean; data: ISkillExchange }) => res.data);
};
