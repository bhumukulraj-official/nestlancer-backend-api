import { Test, TestingModule } from '@nestjs/testing';
import { DashboardUsersService } from '../../../src/services/dashboard-users.service';
import { HttpService } from '@nestjs/axios';
import { PrismaReadService } from '@nestlancer/database';

describe('DashboardUsersService', () => {
    let service: DashboardUsersService;
    let prismaRead: jest.Mocked<PrismaReadService>;

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            providers: [
                DashboardUsersService,
                {
                    provide: HttpService,
                    useValue: {},
                },
                {
                    provide: PrismaReadService,
                    useValue: {
                        user: {
                            count: jest.fn(),
                        },
                    },
                },
            ],
        }).compile();

        service = module.get<DashboardUsersService>(DashboardUsersService);
        prismaRead = module.get(PrismaReadService);
    });

    it('should be defined', () => {
        expect(service).toBeDefined();
    });

    describe('getUserMetrics', () => {
        it('should return various user metrics', async () => {
            prismaRead.user.count
                .mockResolvedValueOnce(200) // total
                .mockResolvedValueOnce(180) // active
                .mockResolvedValueOnce(15)  // newThisMonth
                .mockResolvedValueOnce(190) // users
                .mockResolvedValueOnce(10); // admins

            const result = await service.getUserMetrics();

            expect(result.total).toBe(200);
            expect(result.active).toBe(180);
            expect(result.newThisMonth).toBe(15);
            expect(result.byRole.user).toBe(190);
            expect(result.byRole.admin).toBe(10);
        });
    });

    describe('getUserOverview', () => {
        it('should return user overview counts', async () => {
            prismaRead.user.count
                .mockResolvedValueOnce(200) // total
                .mockResolvedValueOnce(15); // newThisMonth

            const result = await service.getUserOverview('month');

            expect(result.total).toBe(200);
            expect(result.newThisMonth).toBe(15);
            expect(result.trend.current).toBe(200);
        });
    });
});
