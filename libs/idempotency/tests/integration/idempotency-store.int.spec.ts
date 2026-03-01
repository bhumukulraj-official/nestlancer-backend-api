import { Test, TestingModule } from '@nestjs/testing';
import { RedisIdempotencyStore } from '../../src/stores/redis.store';
import { DatabaseIdempotencyStore } from '../../src/stores/database.store';
import { PrismaWriteService } from '@nestlancer/database';
import { setupTestRedis, teardownTestRedis, resetTestRedis, setupTestDatabase, teardownTestDatabase, resetTestDatabase } from '@nestlancer/testing';

describe('Idempotency Stores (Integration)', () => {
    let redisStore: RedisIdempotencyStore;
    let dbStore: DatabaseIdempotencyStore;
    let prisma: PrismaWriteService;

    beforeAll(async () => {
        process.env.REDIS_URL = process.env.REDIS_URL || 'redis://localhost:6379';
        process.env.DATABASE_URL = process.env.DATABASE_URL || 'postgresql://postgres:postgres@localhost:5432/nestlancer_test';
        await setupTestRedis();
        await setupTestDatabase();
    });

    afterAll(async () => {
        await teardownTestRedis();
        await teardownTestDatabase();
    });

    beforeEach(async () => {
        await resetTestRedis();
        await resetTestDatabase();

        const module: TestingModule = await Test.createTestingModule({
            providers: [
                RedisIdempotencyStore,
                DatabaseIdempotencyStore,
                {
                    provide: PrismaWriteService,
                    useValue: new PrismaWriteService(), // Ensure it connects to test DB
                },
            ],
        }).compile();

        redisStore = module.get<RedisIdempotencyStore>(RedisIdempotencyStore);
        dbStore = module.get<DatabaseIdempotencyStore>(DatabaseIdempotencyStore);
        prisma = module.get<PrismaWriteService>(PrismaWriteService);

        await (redisStore as any).onModuleInit?.();
        await prisma.onModuleInit();
    });

    afterEach(async () => {
        await (redisStore as any).onModuleDestroy?.();
        await prisma.onModuleDestroy();
    });

    describe('RedisIdempotencyStore', () => {
        it('should set and get an idempotency record', async () => {
            const key = 'test-key-redis';
            const response = { status: 200, body: { success: true } };

            await redisStore.set(key, { responseCode: 200, responseBody: { success: true } }, 100);
            const retrieved = await redisStore.get(key);

            expect(retrieved).toEqual(response);
        });

        it('should return null for non-existent key', async () => {
            const retrieved = await redisStore.get('missing');
            expect(retrieved).toBeNull();
        });
    });

    describe('DatabaseIdempotencyStore', () => {
        it('should set and get an idempotency record', async () => {
            dbStore.setPrisma(prisma);
            const key = 'test-key-db';
            const responseData = { responseCode: 201, responseBody: { id: 1 } };

            await dbStore.set(key, responseData, 3600);
            const retrieved = await dbStore.get(key);

            expect(retrieved).toEqual(responseData);
        });
    });
});
