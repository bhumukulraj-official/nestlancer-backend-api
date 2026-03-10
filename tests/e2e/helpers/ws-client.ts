/**
 * E2E WebSocket Client
 *
 * Socket.IO client wrapper for testing the WS Gateway.
 * Provides promise-based event waiting and cleanup.
 */

import { io, Socket } from 'socket.io-client';

export interface WsClientConfig {
  url?: string;
  token?: string;
  namespace?: string;
  timeout?: number;
}

export class E2EWsClient {
  private socket: Socket | null = null;
  private url: string;
  private token: string;
  private namespace: string;
  private timeout: number;

  constructor(config: WsClientConfig = {}) {
    this.url = config.url || global.__E2E__?.wsGatewayUrl || 'http://localhost:3100';
    this.token = config.token || '';
    this.namespace = config.namespace || '/';
    this.timeout = config.timeout || 10000;
  }

  /**
   * Connect to the WebSocket server.
   */
  async connect(): Promise<void> {
    return new Promise((resolve, reject) => {
      const connectUrl = this.namespace === '/' ? this.url : `${this.url}${this.namespace}`;

      this.socket = io(connectUrl, {
        auth: { token: this.token },
        transports: ['websocket'],
        forceNew: true,
        timeout: this.timeout,
      });

      const timer = setTimeout(() => {
        reject(new Error(`WebSocket connection timed out after ${this.timeout}ms`));
      }, this.timeout);

      this.socket.on('connect', () => {
        clearTimeout(timer);
        resolve();
      });

      this.socket.on('connect_error', (error: Error) => {
        clearTimeout(timer);
        reject(new Error(`WebSocket connection error: ${error.message}`));
      });
    });
  }

  /**
   * Disconnect from the WebSocket server.
   */
  disconnect(): void {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
    }
  }

  /**
   * Emit an event to the server.
   */
  emit(event: string, data?: any): void {
    if (!this.socket) throw new Error('Not connected');
    this.socket.emit(event, data);
  }

  /**
   * Wait for a specific event from the server.
   * Returns the event data or throws on timeout.
   */
  async waitForEvent<T = any>(event: string, timeoutMs?: number): Promise<T> {
    if (!this.socket) throw new Error('Not connected');

    const waitTimeout = timeoutMs || this.timeout;

    return new Promise<T>((resolve, reject) => {
      const timer = setTimeout(() => {
        reject(new Error(`Timeout waiting for event '${event}' after ${waitTimeout}ms`));
      }, waitTimeout);

      this.socket!.once(event, (data: T) => {
        clearTimeout(timer);
        resolve(data);
      });
    });
  }

  /**
   * Join a room/channel.
   */
  async joinRoom(roomId: string): Promise<void> {
    this.emit('join', { roomId });
    // Give the server time to process
    await new Promise((resolve) => setTimeout(resolve, 200));
  }

  /**
   * Send a message in a room.
   */
  sendMessage(roomId: string, content: string): void {
    this.emit('message', { roomId, content });
  }

  /**
   * Check if currently connected.
   */
  get isConnected(): boolean {
    return this.socket?.connected || false;
  }

  /**
   * Get the underlying socket ID.
   */
  get socketId(): string | undefined {
    return this.socket?.id;
  }
}

/**
 * Create a new WebSocket client for E2E tests.
 */
export function createWsClient(config?: WsClientConfig): E2EWsClient {
  return new E2EWsClient(config);
}

/**
 * Create a WebSocket client with auth token.
 */
export function createAuthenticatedWsClient(
  token: string,
  config?: Omit<WsClientConfig, 'token'>,
): E2EWsClient {
  return new E2EWsClient({ ...config, token });
}
