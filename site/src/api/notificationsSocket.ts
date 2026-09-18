import { io, type Socket } from "socket.io-client";

export const NEW_REQUEST_NOTIFICATION_EVENT = "notification:new-request";

export interface NotificationPayload {
  requestId: string;
  message: string;
  skillTitle?: string;
  fromUserId?: string;
}

interface ServerToClientEvents {
  [NEW_REQUEST_NOTIFICATION_EVENT]: (payload: NotificationPayload) => void;
}

const socketUrl = import.meta.env.VITE_SOCKET_URL ?? "/notifications";

export const notificationsSocket: Socket<ServerToClientEvents> = io(socketUrl, {
  autoConnect: false,
  withCredentials: true,
});
