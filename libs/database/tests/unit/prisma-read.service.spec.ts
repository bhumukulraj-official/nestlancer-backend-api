import { Test, TestingModule } from '@nestjs/testing';
import { PrismaReadService } from '../../src/prisma-read.service';

describe('PrismaReadService', () => {
    let service: PrismaReadService;

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            providers: [PrismaReadService],
        }).compile();

        service = module.get<PrismaReadService>(PrismaReadService);
    });

    it('should be defined', () => {
        expect(service).toBeDefined();
    });

    it('should use DATABASE_READ_URL if provided', () => {
        process.env.DATABASE_READ_URL = 'postgresql://read:read@localhost:5432/nestlancer';
        const readService = new PrismaReadService();
        expect((readService as any).datasourceUrl).toBe(process.env.DATABASE_READ_URL);
    });

    it('should fallback to DATABASE_URL if DATABASE_READ_URL is not provided', () => {
        delete process.env.DATABASE_READ_URL;
        process.env.DATABASE_URL = 'postgresql://write:write@localhost:5432/nestlancer';
        const readService = new PrismaReadService();
        expect((readService as any).datasourceUrl).toBe(process.env.DATABASE_URL);
    });
});
