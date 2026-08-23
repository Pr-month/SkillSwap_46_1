import { OnGatewayConnection, OnGatewayDisconnect } from '@nestjs/websockets';
import { AuthenticatedSocket, NotificationEvent, NotificationPayload } from './gateway.types';
import { WsJwtGuard } from './guards/ws-jwt.guard';
export declare class NotificationsGateway implements OnGatewayConnection, OnGatewayDisconnect {
    private readonly wsJwtGuard;
    private server;
    private readonly connections;
    constructor(wsJwtGuard: WsJwtGuard);
    handleConnection(client: AuthenticatedSocket): Promise<void>;
    handleDisconnect(client: AuthenticatedSocket): void;
    notifyUser(userId: string, event: NotificationEvent, payload: NotificationPayload): boolean;
    isUserOnline(userId: string): boolean;
    getConnectedUserIds(): string[];
    private addConnection;
    private removeConnection;
    private getUserRoom;
}
