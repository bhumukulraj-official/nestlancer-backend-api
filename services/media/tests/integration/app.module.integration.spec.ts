process.env.JWT_ACCESS_SECRET = 'test-secret-long-enough-16-chars';
process.env.JWT_REFRESH_SECRET = 'test-secret-long-enough-16-chars';
process.env.DATABASE_URL = 'postgresql://test:test@localhost:5432/testdb';
process.env.REDIS_URL = 'redis://localhost:6379';
process.env.REDIS_CACHE_URL = 'redis://localhost:6379';
process.env.RABBITMQ_URL = 'amqp://localhost:5672';

import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import { AppModule } from '../../src/app.module';
import { StorageService as LibStorageService } from '@nestlancer/storage';
import { MediaStorageService } from '../../src/storage/storage.service';
import { PrismaWriteService, PrismaReadService } from '@nestlancer/database';
import { NestlancerConfigService as ConfigLibService } from '@nestlancer/config';

describe('AppModule (Integration)', () => {
    let app: INestApplication;

    beforeAll(async () => {
        const moduleRef: TestingModule = await Test.createTestingModule({
            imports: [AppModule],
        })
            .overrideProvider(LibStorageService)
            .useValue({
                getSignedUrl: jest.fn().mockResolvedValue('https://example.com'),
                upload: jest.fn().mockResolvedValue({}),
                delete: jest.fn().mockResolvedValue({}),
                exists: jest.fn().mockResolvedValue(true),
                download: jest.fn().mockResolvedValue(Buffer.from('')),
                onModuleInit: jest.fn(),
            })
            .overrideProvider(MediaStorageService)
            .useValue({
                generateStorageKey: jest.fn().mockReturnValue('key'),
                generatePresignedUploadUrl: jest.fn().mockResolvedValue('https://example.com'),
                generatePresignedDownloadUrl: jest.fn().mockResolvedValue('https://example.com'),
                upload: jest.fn().mockResolvedValue({}),
                deleteFile: jest.fn().mockResolvedValue({}),
                getFileSize: jest.fn().mockResolvedValue(0),
            })
            .overrideProvider(PrismaWriteService)
            .useValue({
                media: {
                    findFirst: jest.fn().mockResolvedValue({ id: '1', metadata: { storageKey: 'key' } }),
                    create: jest.fn().mockResolvedValue({ id: '1' }),
                    update: jest.fn().mockResolvedValue({ id: '1' }),
                    delete: jest.fn().mockResolvedValue({ id: '1' }),
                },
                mediaShareLink: {
                    create: jest.fn().mockResolvedValue({ id: '1' }),
                    findUnique: jest.fn().mockResolvedValue({ id: '1' }),
                    delete: jest.fn().mockResolvedValue({ id: '1' }),
                },
                onModuleInit: jest.fn(),
                onModuleDestroy: jest.fn(),
            })
            .overrideProvider(PrismaReadService)
            .useValue({
                media: {
                    findFirst: jest.fn().mockResolvedValue({ id: '1', metadata: { storageKey: 'key' } }),
                    findMany: jest.fn().mockResolvedValue([]),
                    count: jest.fn().mockResolvedValue(0),
                    findUnique: jest.fn().mockResolvedValue({ id: '1', metadata: { storageKey: 'key' } }),
                    aggregate: jest.fn().mockResolvedValue({ _sum: { size: 0 } }),
                    groupBy: jest.fn().mockResolvedValue([]),
                },
                mediaShareLink: {
                    findUnique: jest.fn().mockResolvedValue({ id: '1' }),
                },
                onModuleInit: jest.fn(),
                onModuleDestroy: jest.fn(),
            })
            .overrideProvider(ConfigLibService)
            .useValue({
                get: jest.fn().mockReturnValue('https://nestlancer.com'),
                getOptional: jest.fn().mockReturnValue('https://nestlancer.com'),
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

    it('should initialize the HTTP service application successfully', () => {
        expect(app).toBeDefined();
    });

    it('should resolve AppModule dependencies', () => {
        const appModule = app.get(AppModule);
        expect(appModule).toBeDefined();
    });
});
