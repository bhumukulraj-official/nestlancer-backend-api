/**
 * E2E setup: bootstraps the WebSocket Gateway app (no Redis adapter; default in-memory).
 * Mocks CacheService and RedisSubscriberService so connection/presence work without Redis.
 */
process.env.NODE_ENV = 'test';
process.env.DATABASE_URL =
  process.env.DATABASE_URL || 'postgresql://user:pass@localhost:5432/testdb';
process.env.JWT_ACCESS_SECRET =
  process.env.JWT_ACCESS_SECRET || 'test-secret-32-chars-minimum!!';
process.env.REDIS_PUB_SUB_URL = process.env.REDIS_PUB_SUB_URL || 'redis://localhost:6379/1';

import { INestApplication } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import { WsExceptionFilter } from '../src/filters/ws-exception.filter';
import { WsAppModule } from '../src/app.module';
import { CacheService } from '@nestlancer/cache';
import { RedisSubscriberService } from '../src/services/redis-subscriber.service';
import { WsAuthGuard } from '@nestlancer/websocket';

const mockRedisClient = () => {
  const store: Record<string, string> = {};
  const sets: Record<string, Set<string>> = {};
  return {
    get: jest.fn().mockImplementation((k: string) => Promise.resolve(store[k] ?? null)),
    set: jest.fn().mockImplementation((k: string, v: string) => {
      store[k] = v;
      return Promise.resolve('OK');
    }),
    del: jest.fn().mockImplementation((k: string) => {
      delete store[k];
      delete sets[k];
      return Promise.resolve(1);
    }),
    sadd: jest.fn().mockImplementation((k: string, ...members: string[]) => {
      if (!sets[k]) sets[k] = new Set();
      members.forEach((m) => sets[k].add(m));
      return Promise.resolve(1);
    }),
    srem: jest.fn().mockImplementation((k: string, ...members: string[]) => {
      if (!sets[k]) return Promise.resolve(0);
      members.forEach((m) => sets[k].delete(m));
      return Promise.resolve(1);
    }),
    scard: jest.fn().mockImplementation((k: string) => Promise.resolve(sets[k]?.size ?? 0)),
    smembers: jest.fn().mockImplementation((k: string) => Promise.resolve(Array.from(sets[k] ?? []))),
    expire: jest.fn().mockResolvedValue(1),
    keys: jest.fn().mockImplementation((pattern: string) => {
      const prefix = pattern.replace('*', '');
      return Promise.resolve([...Object.keys(store), ...Object.keys(sets)].filter((k) => k.startsWith(prefix)));
    }),
  };
};

let app: INestApplication;

export async function setupApp(): Promise<INestApplication> {
  const client = mockRedisClient();

  const moduleRef = await Test.createTestingModule({
    imports: [WsAppModule],
  })
    .overrideProvider(CacheService)
    .useValue({ getClient: () => client })
    .overrideProvider(RedisSubscriberService)
    .useValue({ onModuleInit: jest.fn(), onModuleDestroy: jest.fn() })
    .overrideGuard(WsAuthGuard)
    .useValue({
      canActivate: (context: any) => {
        const client = context.switchToWs().getClient();
        client.data = client.data || {};
        client.data.user = { userId: 'e2e-user-1' };
        return true;
      },
    })
    .compile();

  app = moduleRef.createNestApplication();
  app.useGlobalFilters(new WsExceptionFilter());
  await app.init();
  await app.listen(0);
  return app;
}

export async function teardownApp(): Promise<void> {
  await app?.close();
}

export function getWsUrl(): string {
  const server = app.getHttpServer();
  const address = server.address() as { port: number };
  return `http://localhost:${address.port}`;
}
