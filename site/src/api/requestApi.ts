import type {
  IMyRequests,
  ISkillExchange,
  ISkillExchangeData,
  TId,
  TRequestStatus,
} from "../utils/types";
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

// POST /requests
export const createRequest = (
  data: ISkillExchangeData,
): Promise<ISkillExchange> => {
  return request<ApiResponse<ApiRequest>>("/requests", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(data),
  }).then((res) => mapApiRequest(res.data));
};

// GET /requests/incoming + /requests/outgoing
export const getMyRequests = async (): Promise<IMyRequests> => {
  const [incoming, outgoing] = await Promise.all([
    request<ApiResponse<ApiRequest[]>>("/requests/incoming").then((res) =>
      res.data.map(mapApiRequest),
    ),

    request<ApiResponse<ApiRequest[]>>("/requests/outgoing").then((res) =>
      res.data.map(mapApiRequest),
    ),
  ]);

  return {
    sent: outgoing,
    received: incoming,
  };
};

// GET /requests/:id
export const getRequestById = (id: TId): Promise<ISkillExchange> => {
  return request<ApiResponse<ApiRequest>>(`/requests/${id}`).then((res) =>
    mapApiRequest(res.data),
  );
};

// PATCH /requests/:id
export const updateRequestStatus = (
  id: TId,
  status: TRequestStatus,
): Promise<ISkillExchange> => {
  return request<ApiResponse<ApiRequest>>(`/requests/${id}`, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ status }),
  }).then((res) => mapApiRequest(res.data));
};

// PATCH /requests/:id (done)
export const completeRequest = (id: TId): Promise<ISkillExchange> => {
  return request<ApiResponse<ApiRequest>>(`/requests/${id}`, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ status: "done" }),
  }).then((res) => mapApiRequest(res.data));
};
