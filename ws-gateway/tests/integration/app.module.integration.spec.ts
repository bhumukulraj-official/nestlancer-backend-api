process.env.DATABASE_URL = 'postgresql://user:pass@localhost:5432/db';
process.env.JWT_ACCESS_SECRET = 'super-secret-access-token-minimum-16-chars';
process.env.JWT_REFRESH_SECRET = 'super-secret-refresh-token-minimum-16-chars';

import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import { WsAppModule } from '../../src/app.module';
import { CacheService } from '@nestlancer/cache';
import { NestlancerConfigService } from '@nestlancer/config';
import { PrismaWriteService, PrismaReadService } from '@nestlancer/database';

describe('WsAppModule (Integration)', () => {
  let app: INestApplication;

  beforeAll(async () => {
    const mockCacheService = {
      getClient: jest.fn().mockReturnValue({
        on: jest.fn(),
        quit: jest.fn(),
        sadd: jest.fn(),
        expire: jest.fn(),
        srem: jest.fn(),
        scard: jest.fn(),
        smembers: jest.fn(),
        set: jest.fn(),
        del: jest.fn(),
        get: jest.fn(),
        keys: jest.fn(),
      }),
    };

    const moduleRef: TestingModule = await Test.createTestingModule({
      imports: [WsAppModule],
    })
      .overrideProvider(CacheService)
      .useValue(mockCacheService)
      .overrideProvider(PrismaWriteService)
      .useValue({})
      .overrideProvider(PrismaReadService)
      .useValue({})
      .overrideProvider(NestlancerConfigService)
      .useValue({
        port: 3100,
      })
      .compile();

    app = moduleRef.createNestApplication();
    await app.init();
  });

  afterAll(async () => {
    if (app) {
      await app.close();
    }
  });

  it('should initialize the WebSocket gateway application successfully', () => {
    expect(app).toBeDefined();
  });

  it('should resolve WsAppModule dependencies', () => {
    const appModule = app.get(WsAppModule);
    expect(appModule).toBeDefined();
  });
});
