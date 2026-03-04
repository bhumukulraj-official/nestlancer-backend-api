import { Test, TestingModule } from '@nestjs/testing';
import { DashboardProjectsService } from '../../../src/services/dashboard-projects.service';
import { HttpService } from '@nestjs/axios';
import { PrismaReadService } from '@nestlancer/database';

describe('DashboardProjectsService', () => {
    let service: DashboardProjectsService;
    let prismaRead: jest.Mocked<PrismaReadService>;

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            providers: [
                DashboardProjectsService,
                {
                    provide: HttpService,
                    useValue: {},
                },
                {
                    provide: PrismaReadService,
                    useValue: {
                        project: {
                            count: jest.fn(),
                        },
                    },
                },
            ],
        }).compile();

        service = module.get<DashboardProjectsService>(DashboardProjectsService);
        prismaRead = module.get(PrismaReadService);
    });

    it('should be defined', () => {
        expect(service).toBeDefined();
    });

    describe('getProjectMetrics', () => {
        it('should return project counts correctly', async () => {
            prismaRead.project.count.mockImplementation(async (args?: any) => {
                if (!args) return 100;
                switch (args.where?.status) {
                    case 'IN_PROGRESS': return 50;
                    case 'COMPLETED': return 30;
                    case 'ON_HOLD': return 10;
                    case 'CANCELLED': return 10;
                    default: return 0;
                }
            });

            const metrics = await service.getProjectMetrics();

            expect(metrics.total).toBe(100);
            expect(metrics.byStatus.ACTIVE).toBe(50);
            expect(metrics.byStatus.COMPLETED).toBe(30);
        });
    });

    describe('getProjectOverview', () => {
        it('should return overview counts correctly', async () => {
            prismaRead.project.count.mockResolvedValue(10); // Mocking it to return 10 for all for simplicity
            const overview = await service.getProjectOverview('month');
            expect(overview.active).toBe(10);
            expect(overview.completed).toBe(10);
            expect(overview.byStatus.pendingPayment).toBe(10);
        });
    });
});
