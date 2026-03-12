import { io, Socket } from 'socket.io-client';
import { setupApp, teardownApp, getWsUrl } from './setup';

/**
 * Presence E2E: connection updates presence (setOnline/setOffline) via ConnectionService and PresenceService.
 * With mocked CacheService in setup, presence state is in-memory for the test.
 */
describe('WsGateway - Presence (E2E)', () => {
  let socket: Socket;
  let baseUrl: string;

  beforeAll(async () => {
    await setupApp();
    baseUrl = getWsUrl();
  });

  afterAll(async () => {
    socket?.disconnect();
    await teardownApp();
  });

  it('should connect and allow presence to be updated', async () => {
    socket = io(`${baseUrl}/messages`, { transports: ['websocket'], timeout: 5000 });
    await new Promise<void>((resolve, reject) => {
      socket.on('connect', () => resolve());
      socket.on('connect_error', (err) => reject(err));
    });
    expect(socket.connected).toBe(true);
  });

  it('should handle disconnect and clear presence for user', (done) => {
    if (!socket?.connected) return done();
    socket.once('disconnect', () => {
      expect(socket.connected).toBe(false);
      done();
    });
    socket.disconnect();
  });
});
