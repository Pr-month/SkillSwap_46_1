import { Server } from 'socket.io';

import {
  AuthenticatedSocket,
  NotificationEvent,
  NotificationPayload,
  SocketUser,
} from './gateway.types';
import { WsJwtGuard } from './guards/ws-jwt.guard';
import { NotificationsGateway } from './notifications.gateway';

interface ClientMock {
  client: AuthenticatedSocket;
  joinMock: jest.Mock;
  disconnectMock: jest.Mock;
}

describe('NotificationsGateway', () => {
  let gateway: NotificationsGateway;
  let authenticateMock: jest.Mock;
  let toMock: jest.Mock;
  let emitMock: jest.Mock;

  const user: SocketUser = {
    id: 'user-id',
    email: 'user@example.com',
  };

  const createClient = (id: string): ClientMock => {
    const joinMock = jest.fn().mockResolvedValue(undefined);
    const disconnectMock = jest.fn();

    const client = {
      id,
      data: {},
      join: joinMock,
      disconnect: disconnectMock,
    } as unknown as AuthenticatedSocket;

    return {
      client,
      joinMock,
      disconnectMock,
    };
  };

  beforeEach(() => {
    authenticateMock = jest.fn();

    const wsJwtGuard = {
      authenticate: authenticateMock,
    } as unknown as WsJwtGuard;

    gateway = new NotificationsGateway(wsJwtGuard);

    emitMock = jest.fn();
    toMock = jest.fn().mockReturnValue({
      emit: emitMock,
    });

    const server = {
      to: toMock,
    } as unknown as Server;

    Object.defineProperty(gateway, 'server', {
      value: server,
    });
  });

  it('аутентифицирует клиента и присоединяет его к личной комнате', async () => {
    const { client, joinMock, disconnectMock } = createClient('socket-1');

    authenticateMock.mockImplementation(
      (authenticatedClient: AuthenticatedSocket) => {
        authenticatedClient.data.user = user;

        return Promise.resolve(user);
      },
    );

    await gateway.handleConnection(client);

    expect(authenticateMock).toHaveBeenCalledWith(client);
    expect(joinMock).toHaveBeenCalledWith('user:user-id');
    expect(disconnectMock).not.toHaveBeenCalled();
    expect(gateway.isUserOnline('user-id')).toBe(true);
    expect(gateway.getConnectedUserIds()).toEqual(['user-id']);
  });

  it('отключает неавторизованного клиента', async () => {
    const { client, joinMock, disconnectMock } = createClient('socket-1');

    authenticateMock.mockRejectedValue(new Error('Unauthorized'));

    await gateway.handleConnection(client);

    expect(joinMock).not.toHaveBeenCalled();
    expect(disconnectMock).toHaveBeenCalledWith(true);
    expect(gateway.isUserOnline('user-id')).toBe(false);
  });

  it('учитывает несколько подключений одного пользователя', async () => {
    const firstClient = createClient('socket-1');
    const secondClient = createClient('socket-2');

    authenticateMock.mockImplementation(
      (authenticatedClient: AuthenticatedSocket) => {
        authenticatedClient.data.user = user;

        return Promise.resolve(user);
      },
    );

    await gateway.handleConnection(firstClient.client);
    await gateway.handleConnection(secondClient.client);

    gateway.handleDisconnect(firstClient.client);

    expect(gateway.isUserOnline('user-id')).toBe(true);

    gateway.handleDisconnect(secondClient.client);

    expect(gateway.isUserOnline('user-id')).toBe(false);
    expect(gateway.getConnectedUserIds()).toEqual([]);
  });

  it('отправляет уведомление в личную комнату online-пользователя', async () => {
    const { client } = createClient('socket-1');

    authenticateMock.mockImplementation(
      (authenticatedClient: AuthenticatedSocket) => {
        authenticatedClient.data.user = user;

        return Promise.resolve(user);
      },
    );

    await gateway.handleConnection(client);

    const payload: NotificationPayload = {
      requestId: 'request-id',
      message: 'Поступила новая заявка',
      skillTitle: 'TypeScript',
      fromUserId: 'sender-id',
    };

    const result = gateway.notifyUser(
      'user-id',
      NotificationEvent.NewRequest,
      payload,
    );

    expect(result).toBe(true);
    expect(toMock).toHaveBeenCalledWith('user:user-id');
    expect(emitMock).toHaveBeenCalledWith(
      NotificationEvent.NewRequest,
      payload,
    );
  });

  it('не отправляет уведомление offline-пользователю', () => {
    const payload: NotificationPayload = {
      requestId: 'request-id',
      message: 'Поступила новая заявка',
    };

    const result = gateway.notifyUser(
      'offline-user-id',
      NotificationEvent.NewRequest,
      payload,
    );

    expect(result).toBe(false);
    expect(toMock).not.toHaveBeenCalled();
    expect(emitMock).not.toHaveBeenCalled();
  });

  it('безопасно обрабатывает отключение неаутентифицированного клиента', () => {
    const { client } = createClient('socket-1');

    expect(() => gateway.handleDisconnect(client)).not.toThrow();
    expect(gateway.getConnectedUserIds()).toEqual([]);
  });
});
