import {
  OnGatewayConnection,
  OnGatewayDisconnect,
  WebSocketGateway,
  WebSocketServer,
} from '@nestjs/websockets';
import { Server } from 'socket.io';

import {
  AuthenticatedSocket,
  NotificationEvent,
  NotificationPayload,
} from './gateway.types';
import { WsJwtGuard } from './guards/ws-jwt.guard';

@WebSocketGateway({
  namespace: '/notifications',
  cors: {
    origin: true,
    credentials: true,
  },
})
export class NotificationsGateway
  implements OnGatewayConnection, OnGatewayDisconnect
{
  @WebSocketServer()
  private server!: Server;

  private readonly connections = new Map<string, Set<string>>();

  constructor(private readonly wsJwtGuard: WsJwtGuard) {}

  async handleConnection(client: AuthenticatedSocket): Promise<void> {
    try {
      const user = await this.wsJwtGuard.authenticate(client);

      await client.join(this.getUserRoom(user.id));
      this.addConnection(user.id, client.id);
    } catch {
      client.disconnect(true);
    }
  }

  handleDisconnect(client: AuthenticatedSocket): void {
    const userId = client.data.user?.id;

    if (!userId) {
      return;
    }

    this.removeConnection(userId, client.id);
  }

  notifyUser(
    userId: string,
    event: NotificationEvent,
    payload: NotificationPayload,
  ): void {
    this.server.to(this.getUserRoom(userId)).emit(event, payload);
  }

  isUserOnline(userId: string): boolean {
    return this.connections.has(userId);
  }

  getConnectedUserIds(): string[] {
    return [...this.connections.keys()];
  }

  private addConnection(userId: string, socketId: string): void {
    const userConnections = this.connections.get(userId) ?? new Set<string>();

    userConnections.add(socketId);
    this.connections.set(userId, userConnections);
  }

  private removeConnection(userId: string, socketId: string): void {
    const userConnections = this.connections.get(userId);

    if (!userConnections) {
      return;
    }

    userConnections.delete(socketId);

    if (userConnections.size === 0) {
      this.connections.delete(userId);
    }
  }

  private getUserRoom(userId: string): string {
    return `user:${userId}`;
  }
}
