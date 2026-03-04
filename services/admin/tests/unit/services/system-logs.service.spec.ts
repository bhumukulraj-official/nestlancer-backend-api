import { Test, TestingModule } from '@nestjs/testing';
import { SystemLogsService } from '../../src/services/system-logs.service';
import { PrismaReadService } from '@nestlancer/database';
import { QueryLogsDto } from '../../src/dto/query-logs.dto';

describe('SystemLogsService', () => {
    let service: SystemLogsService;
    let prismaRead: jest.Mocked<PrismaReadService>;

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            providers: [
                SystemLogsService,
                {
                    provide: PrismaReadService,
                    useValue: {
                        auditLog: {
                            findMany: jest.fn(),
                            count: jest.fn(),
                        },
                    },
                },
            ],
        }).compile();

        service = module.get<SystemLogsService>(SystemLogsService);
        prismaRead = module.get(PrismaReadService);
    });

    it('should be defined', () => {
        expect(service).toBeDefined();
    });

    describe('queryLogs', () => {
        it('should query logs effectively', async () => {
            const mockLogs = [
                { createdAt: new Date(), category: 'INFO', resourceType: 'auth', description: 'Log in' }
            ];
            prismaRead.auditLog.findMany.mockResolvedValue(mockLogs as any);
            prismaRead.auditLog.count.mockResolvedValue(1);

            const dto: QueryLogsDto = { page: 1, limit: 10, level: 'info', service: 'auth' } as any;
            const result = await service.queryLogs(dto);

            expect(prismaRead.auditLog.findMany).toHaveBeenCalledWith({
                where: { category: 'INFO', resourceType: 'auth' },
                orderBy: { createdAt: 'desc' },
                skip: 0,
                take: 10,
            });

            expect(result.total).toBe(1);
            expect(result.data.length).toBe(1);
            expect(result.data[0].level).toBe('INFO');
        });
    });

    describe('generateDownloadLink', () => {
        it('should generate download link stub', async () => {
            const dto: QueryLogsDto = {};
            const result = await service.generateDownloadLink(dto);
            expect(result.jobId).toBe('export_job_123');
            expect(result.status).toBe('QUEUED');
        });
    });
});
