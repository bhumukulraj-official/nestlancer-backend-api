import { Test, TestingModule } from '@nestjs/testing';
import { ProjectsService } from '../../src/services/projects.service';
import { PrismaWriteService } from '@nestlancer/database/prisma/prisma-write.service';
import { PrismaReadService } from '@nestlancer/database/prisma/prisma-read.service';
import { BusinessLogicException } from '@nestlancer/common/exceptions/business-logic.exception';

describe('ProjectsService', () => {
    let service: ProjectsService;
    let prismaRead: PrismaReadService;
    let prismaWrite: PrismaWriteService;

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            providers: [
                ProjectsService,
                {
                    provide: PrismaReadService,
                    useValue: { project: { findFirst: jest.fn() } },
                },
                {
                    provide: PrismaWriteService,
                    useValue: {
                        $transaction: jest.fn((cb) => cb(prismaWrite)),
                        project: { update: jest.fn() },
                        outbox: { create: jest.fn() },
                    },
                },
            ],
        }).compile();

        service = module.get<ProjectsService>(ProjectsService);
        prismaRead = module.get<PrismaReadService>(PrismaReadService);
        prismaWrite = module.get<PrismaWriteService>(PrismaWriteService);
    });

    describe('approveProject', () => {
        it('should approve project successfully', async () => {
            const mockProj = { id: 'proj1', userId: 'user1', status: 'REVIEW' };
            jest.spyOn(prismaRead.project, 'findFirst').mockResolvedValue(mockProj as any);

            const dto: any = { rating: 5, feedback: {} };
            const result = await service.approveProject('user1', 'proj1', dto);

            expect(result.status).toEqual('completed');
            expect(prismaWrite.project.update).toHaveBeenCalled();
            expect(prismaWrite.outbox.create).toHaveBeenCalled();
        });

        it('should throw if project not ready', async () => {
            const mockProj = { id: 'proj1', userId: 'user1', status: 'IN_PROGRESS' };
            jest.spyOn(prismaRead.project, 'findFirst').mockResolvedValue(mockProj as any);

            const dto: any = { rating: 5, feedback: {} };
            await expect(service.approveProject('user1', 'proj1', dto)).rejects.toThrow('Project not ready for approval');
        });
    });
});
