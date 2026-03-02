import { Test, TestingModule } from '@nestjs/testing';
import { DatabaseModule } from '../../src/database.module';
import { PrismaWriteService } from '../../src/prisma-write.service';
import { PrismaReadService } from '../../src/prisma-read.service';
import { ConfigModule } from '@nestjs/config';

// Mock Prisma and pg to avoid connection issues
jest.mock('@prisma/client', () => ({
  PrismaClient: jest.fn().mockImplementation(() => ({
    $connect: jest.fn().mockResolvedValue(undefined),
    $disconnect: jest.fn().mockResolvedValue(undefined),
  })),
}));

jest.mock('@prisma/adapter-pg', () => ({
  PrismaPg: jest.fn().mockImplementation(() => ({})),
}));

jest.mock('pg', () => ({
  Pool: jest.fn().mockImplementation(() => ({
    on: jest.fn(),
    end: jest.fn(),
  })),
}));

describe('DatabaseModule (Integration)', () => {
  let module: TestingModule;
  let writeService: PrismaWriteService;
  let readService: PrismaReadService;

  beforeAll(async () => {
    process.env.NODE_ENV = 'test';
    process.env.DATABASE_URL = 'postgres://localhost:5432/db';
    process.env.REDIS_CACHE_URL = 'redis://localhost:6379';
    process.env.RABBITMQ_URL = 'amqp://localhost';
    process.env.JWT_ACCESS_SECRET = 'secret1234567890';
    process.env.JWT_REFRESH_SECRET = 'secret1234567890';

    module = await Test.createTestingModule({
      imports: [
        ConfigModule.forRoot({ isGlobal: true, envFilePath: '.env.test' }),
        DatabaseModule.forRoot(),
      ],
    }).compile();

    writeService = module.get<PrismaWriteService>(PrismaWriteService);
    readService = module.get<PrismaReadService>(PrismaReadService);

    // In a real test we would call onModuleInit, but we mock it here
    jest.spyOn(writeService, '$connect').mockResolvedValue(undefined);
    jest.spyOn(readService, '$connect').mockResolvedValue(undefined);
  });

  afterAll(async () => {
    if (module) {
      await module.close();
    }
  });

  it('should be defined', () => {
    expect(writeService).toBeDefined();
    expect(readService).toBeDefined();
  });

  it('should provide separate instances for read and write', () => {
    expect(writeService).not.toBe(readService);
  });
});
