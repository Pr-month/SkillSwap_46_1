import { ExecutionContext } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { WsException } from '@nestjs/websockets';

import { ConfigurationService } from '../../module/configuration/configuration.service';
import { AuthenticatedSocket, SocketUser } from '../gateway.types';
import { WsJwtGuard } from './ws-jwt.guard';

describe('WsJwtGuard', () => {
  let guard: WsJwtGuard;
  let verifyAsyncMock: jest.Mock;

  const createClient = (cookie?: string): AuthenticatedSocket =>
    ({
      handshake: {
        headers: cookie ? { cookie } : {},
      },
      data: {},
    }) as unknown as AuthenticatedSocket;

  beforeEach(() => {
    verifyAsyncMock = jest.fn();

    const jwtService = {
      verifyAsync: verifyAsyncMock,
    } as unknown as JwtService;

    const configurationService = {
      jwtAccessSecret: 'access-secret',
    } as ConfigurationService;

    guard = new WsJwtGuard(jwtService, configurationService);
  });

  it('аутентифицирует клиента по accessToken из cookie', async () => {
    const client = createClient('accessToken=valid-token; other=value');

    verifyAsyncMock.mockResolvedValue({
      sub: 'user-id',
      email: 'user@example.com',
      tokenType: 'access',
    });

    const result = await guard.authenticate(client);

    expect(verifyAsyncMock).toHaveBeenCalledWith('valid-token', {
      secret: 'access-secret',
    });
    expect(result).toEqual({
      id: 'user-id',
      email: 'user@example.com',
    });
    expect(client.data.user).toEqual(result);
  });

  it('отклоняет подключение без cookie', async () => {
    const client = createClient();

    await expect(guard.authenticate(client)).rejects.toThrow(
      'Необходима авторизация',
    );
    expect(verifyAsyncMock).not.toHaveBeenCalled();
  });

  it('отклоняет подключение без accessToken в cookie', async () => {
    const client = createClient('refreshToken=refresh-token');

    await expect(guard.authenticate(client)).rejects.toThrow(
      'Необходима авторизация',
    );
    expect(verifyAsyncMock).not.toHaveBeenCalled();
  });

  it('отклоняет refresh token', async () => {
    const client = createClient('accessToken=refresh-token');

    verifyAsyncMock.mockResolvedValue({
      sub: 'user-id',
      email: 'user@example.com',
      tokenType: 'refresh',
    });

    await expect(guard.authenticate(client)).rejects.toThrow(
      'Недействительный access token',
    );
  });

  it('отклоняет недействительный или просроченный JWT', async () => {
    const client = createClient('accessToken=expired-token');

    verifyAsyncMock.mockRejectedValue(new Error('jwt expired'));

    await expect(guard.authenticate(client)).rejects.toThrow(
      'Недействительный или просроченный токен',
    );
  });

  it('разрешает WebSocket context после успешной аутентификации', async () => {
    const client = createClient();
    const user: SocketUser = {
      id: 'user-id',
      email: 'user@example.com',
    };

    const authenticateSpy = jest
      .spyOn(guard, 'authenticate')
      .mockResolvedValue(user);

    const context = {
      switchToWs: () => ({
        getClient: () => client,
      }),
    } as unknown as ExecutionContext;

    await expect(guard.canActivate(context)).resolves.toBe(true);
    expect(authenticateSpy).toHaveBeenCalledWith(client);
  });

  it('сохраняет исходную WsException', async () => {
    const client = createClient('accessToken=invalid-access-token');
    const expectedError = new WsException('Недействительный access token');

    verifyAsyncMock.mockRejectedValue(expectedError);

    await expect(guard.authenticate(client)).rejects.toBe(expectedError);
  });
});
