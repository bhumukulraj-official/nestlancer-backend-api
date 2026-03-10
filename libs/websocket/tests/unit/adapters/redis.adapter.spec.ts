import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import { RedisIoAdapter } from '../../../src/adapters/redis.adapter';

describe('RedisIoAdapter', () => {
  let adapter: RedisIoAdapter;
  let app: INestApplication;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({}).compile();
    app = module.createNestApplication();
    adapter = new RedisIoAdapter(app);
  });

  it('should create an IO server with options', () => {
    const createIOServerSpy = jest.spyOn(
      Object.getPrototypeOf(RedisIoAdapter.prototype),
      'createIOServer',
    );
    const server = adapter.createIOServer(3000, { path: '/ws' } as any);

    expect(createIOServerSpy).toHaveBeenCalledWith(3000, {
      path: '/ws',
      cleanupEmptyChildNamespaces: false,
      cors: { origin: '*', credentials: true },
    });
    expect(server).toBeDefined();

    // Close server to prevent open handles
    server.close();
  });
});
