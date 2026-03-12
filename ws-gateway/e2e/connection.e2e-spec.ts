import { io, Socket } from 'socket.io-client';
import { setupApp, teardownApp, getWsUrl } from './setup';

describe('WsGateway - Connection (E2E)', () => {
  let socket: Socket;

  beforeAll(async () => {
    await setupApp();
  });

  afterAll(async () => {
    socket?.disconnect();
    await teardownApp();
  });

  it('should connect to default namespace', async () => {
    const url = getWsUrl();
    socket = io(url, { transports: ['websocket'], timeout: 5000 });
    await new Promise<void>((resolve, reject) => {
      socket.on('connect', () => resolve());
      socket.on('connect_error', (err) => reject(err));
    });
    expect(socket.connected).toBe(true);
  });

  it('should disconnect cleanly', async () => {
    if (!socket?.connected) return;
    socket.disconnect();
    expect(socket.connected).toBe(false);
  });
});
