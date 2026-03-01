import { Test, TestingModule } from '@nestjs/testing';
import { RequestsService } from '../../../src/services/requests.service';
import { PrismaWriteService } from '@nestlancer/database/prisma/prisma-write.service';
import { PrismaReadService } from '@nestlancer/database/prisma/prisma-read.service';
import { BusinessLogicException } from '@nestlancer/common/exceptions/business-logic.exception';

describe('RequestsService', () => {
    let service: RequestsService;
    let prismaRead: PrismaReadService;
    let prismaWrite: PrismaWriteService;

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            providers: [
                RequestsService,
                {
                    provide: PrismaReadService,
                    useValue: { projectRequest: { findFirst: jest.fn(), findMany: jest.fn() } },
                },
                {
                    provide: PrismaWriteService,
                    useValue: {
                        $transaction: jest.fn((cb) => cb(prismaWrite)),
                        projectRequest: { create: jest.fn(), update: jest.fn() },
                        requestStatusHistory: { create: jest.fn() },
                        outbox: { create: jest.fn() },
                    },
                },
            ],
        }).compile();

        service = module.get<RequestsService>(RequestsService);
        prismaRead = module.get<PrismaReadService>(PrismaReadService);
        prismaWrite = module.get<PrismaWriteService>(PrismaWriteService);
    });

    describe('submitRequest', () => {
        it('should submit valid draft request', async () => {
            const mockReq = { id: 'req1', userId: 'user1', status: 'DRAFT', budgetMin: 100, deadline: new Date() };
            jest.spyOn(prismaRead.projectRequest, 'findFirst').mockResolvedValue(mockReq as any);

            const result = await service.submitRequest('user1', 'req1');

            expect(result.status).toEqual('submitted');
            expect(prismaWrite.projectRequest.update).toHaveBeenCalledWith({
                where: { id: 'req1' },
                data: { status: 'SUBMITTED', submittedAt: expect.any(Date) }
            });
            expect(prismaWrite.outbox.create).toHaveBeenCalled();
        });

        it('should throw if request not found', async () => {
            jest.spyOn(prismaRead.projectRequest, 'findFirst').mockResolvedValue(null);
            await expect(service.submitRequest('user1', 'req1')).rejects.toThrow();
        });

        it('should throw if missing budget', async () => {
            const mockReq = { id: 'req1', userId: 'user1', status: 'DRAFT', deadline: new Date() }; // missing budgetMin
            jest.spyOn(prismaRead.projectRequest, 'findFirst').mockResolvedValue(mockReq as any);

            await expect(service.submitRequest('user1', 'req1')).rejects.toThrow();
        });
    });
});
