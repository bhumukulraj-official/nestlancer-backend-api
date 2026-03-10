import { ExecutionContext } from '@nestjs/common';
import { WsException } from '@nestjs/websockets';
import { WsAuthGuard } from '../../../src/guards/ws-auth.guard';

describe('WsAuthGuard', () => {
  let guard: WsAuthGuard;

  beforeEach(() => {
    guard = new WsAuthGuard();
  });

  it('should allow access if token is in handshake auth', () => {
    const mockContext = {
      switchToWs: () => ({
        getClient: () => ({
          handshake: { auth: { token: 'valid-token' } },
        }),
      }),
    } as ExecutionContext;

    expect(guard.canActivate(mockContext)).toBe(true);
  });

  it('should allow access if token is in handshake headers', () => {
    const mockContext = {
      switchToWs: () => ({
        getClient: () => ({
          handshake: { headers: { authorization: 'Bearer valid-token' } },
        }),
      }),
    } as ExecutionContext;

    expect(guard.canActivate(mockContext)).toBe(true);
  });

  it('should throw WsException if token is missing', () => {
    const mockContext = {
      switchToWs: () => ({
        getClient: () => ({ handshake: {} }),
      }),
    } as ExecutionContext;

    expect(() => guard.canActivate(mockContext)).toThrow(WsException);
  });
});
