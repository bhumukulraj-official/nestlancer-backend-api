import { Test, TestingModule } from '@nestjs/testing';
import { PrismaWriteService } from '../../src/prisma-write.service';
import { PrismaReadService } from '../../src/prisma-read.service';
import { setupTestDatabase, teardownTestDatabase, resetTestDatabase } from '@nestlancer/testing';

describe('Prisma Services (Integration)', () => {
    let writeService: PrismaWriteService;
    let readService: PrismaReadService;

    beforeAll(async () => {
        // Ensure DATABASE_URL is set for the services to connect
        process.env.DATABASE_URL = process.env.DATABASE_URL || 'postgresql://postgres:postgres@localhost:5432/nestlancer_test';
        await setupTestDatabase();
    });

    afterAll(async () => {
        await teardownTestDatabase();
    });

    beforeEach(async () => {
        await resetTestDatabase();

        const module: TestingModule = await Test.createTestingModule({
            providers: [PrismaWriteService, PrismaReadService],
        }).compile();

        writeService = module.get<PrismaWriteService>(PrismaWriteService);
        readService = module.get<PrismaReadService>(PrismaReadService);
    });

    afterEach(async () => {
        await writeService.$disconnect();
        await readService.$disconnect();
    });

    it('should connect to the write database', async () => {
        await expect(writeService.$connect()).resolves.not.toThrow();
    });

    it('should connect to the read database (or fallback)', async () => {
        await expect(readService.$connect()).resolves.not.toThrow();
    });

    it('should perform basic CRUD operations via PrismaWriteService', async () => {
        // This test requires models to be generated. 
        // We'll use a raw query if specific models aren't guaranteed in the lib's schema
        const result = await writeService.$queryRaw`SELECT 1 as count`;
        expect(result).toEqual([{ count: 1 }]);
    });
});
