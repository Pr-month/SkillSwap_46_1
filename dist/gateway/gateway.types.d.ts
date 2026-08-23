import { Socket } from 'socket.io';
export interface SocketUser {
    id: string;
    email: string;
}
export type AuthenticatedSocket = Socket & {
    data: Socket['data'] & {
        user?: SocketUser;
    };
};
export declare enum NotificationEvent {
    NewRequest = "notification:new-request",
    RequestAccepted = "notification:request-accepted",
    RequestRejected = "notification:request-rejected"
}
export interface NotificationPayload {
    requestId: string;
    message: string;
    skillTitle?: string;
    fromUserId?: string;
}
