import { IoAdapter } from '@nestjs/platform-socket.io';
import { INestApplication } from '@nestjs/common';
import { ServerOptions } from 'socket.io';

export class RedisIoAdapter extends IoAdapter {
  constructor(app: INestApplication) { super(app); }
  createIOServer(port: number, options?: ServerOptions) {
    const server = super.createIOServer(port, { ...options, cors: { origin: '*', credentials: true } });
    // In production: configure with Redis pub/sub adapter for multi-instance support
    return server;
  }
}
