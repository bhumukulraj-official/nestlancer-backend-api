import { Test, TestingModule } from '@nestjs/testing';
import { AuditWriterService } from '../../src/audit-writer.service';
import { AuditRepository } from '../../src/audit.repository';
import { PrismaWriteService } from '@nestlancer/database';
import { setupTestDatabase, teardownTestDatabase, resetTestDatabase } from '@nestlancer/testing';

describe('AuditWriterService (Integration)', () => {
    let service: AuditWriterService;
    let repository: AuditRepository;
    let prisma: PrismaWriteService;

    beforeAll(async () => {
        process.env.DATABASE_URL = process.env.DATABASE_URL || 'postgresql://postgres:postgres@localhost:5432/nestlancer_test';
        await setupTestDatabase();
    });

    afterAll(async () => {
        await teardownTestDatabase();
    });

    beforeEach(async () => {
        await resetTestDatabase();

        const module: TestingModule = await Test.createTestingModule({
            providers: [
                AuditWriterService,
                AuditRepository,
                {
                    provide: PrismaWriteService,
                    useValue: new PrismaWriteService(),
                },
            ],
        }).compile();

        service = module.get<AuditWriterService>(AuditWriterService);
        repository = module.get<AuditRepository>(AuditRepository);
        prisma = module.get<PrismaWriteService>(PrismaWriteService);

        await prisma.onModuleInit();
        (repository as any).prisma = prisma;
    });

    afterEach(async () => {
        await service.onModuleDestroy();
        await prisma.onModuleDestroy();
    });

    it('should buffer and then flush audit entries', async () => {
        const entry = {
            userId: 'user-1',
            action: 'CREATE',
            resourceType: 'PROJECT',
            resourceId: 'proj-1',
            changes: { status: 'new' },
        };

        // 1. Write to buffer
        await service.write(entry as any);

        // 2. Verify not yet in DB (assuming batch size > 1)
        let dbEntries = await prisma.auditLog.findMany();
        expect(dbEntries).toHaveLength(0);

        // 3. Force flush
        await service.flush();

        // 4. Verify in DB
        dbEntries = await prisma.auditLog.findMany();
        expect(dbEntries).toHaveLength(1);
        expect(dbEntries[0].action).toBe('CREATE');
    });

    it('should write direct without buffering', async () => {
        const entry = {
            userId: 'user-2',
            action: 'DELETE',
            resourceType: 'PROJECT',
            resourceId: 'proj-2',
        };

        await service.writeDirect(entry as any);

        const dbEntries = await prisma.auditLog.findMany();
        expect(dbEntries).toHaveLength(1);
        expect(dbEntries[0].action).toBe('DELETE');
    });
});
