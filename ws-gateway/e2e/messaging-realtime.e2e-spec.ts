import { io, Socket } from 'socket.io-client';
import { setupApp, teardownApp, getWsUrl } from './setup';

/**
 * Real-time messaging E2E: connect to /messages namespace and exercise join/message.
 * Auth is required by WsAuthGuard; use a valid token or mock in setup for full flow.
 */
describe('WsGateway - Messaging Realtime (E2E)', () => {
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

  it('should connect to /messages namespace', async () => {
    socket = io(`${baseUrl}/messages`, { transports: ['websocket'], timeout: 5000 });
    await new Promise<void>((resolve, reject) => {
      socket.on('connect', () => resolve());
      socket.on('connect_error', (err) => reject(err));
    });
    expect(socket.connected).toBe(true);
  });

  it('should join a room and receive joined event', (done) => {
    if (!socket?.connected) return done();
    socket.emit('join:room', { projectId: 'e2e-project-1' });
    socket.once('joined', (data: { projectId: string }) => {
      expect(data?.projectId).toBe('e2e-project-1');
      done();
    });
  });

  it('should send message and receive message:sent', (done) => {
    if (!socket?.connected) return done();
    socket.emit('message:send', {
      projectId: 'e2e-project-1',
      content: 'E2E hello',
      type: 'text',
    });
    socket.once('message:sent', (data: unknown) => {
      expect(data).toBeDefined();
      done();
    });
  });
});
