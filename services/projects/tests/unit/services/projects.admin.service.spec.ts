import { ProjectsAdminService } from '../../../src/services/projects.admin.service';

describe('ProjectsAdminService', () => {
    let service: ProjectsAdminService;
    let mockPrismaWrite: any;
    let mockPrismaRead: any;

    beforeEach(() => {
        mockPrismaRead = {
            project: {
                findMany: jest.fn().mockResolvedValue([{ id: 'p1', title: 'Website', status: 'IN_PROGRESS', createdAt: new Date(), user: { firstName: 'John', email: 'test@example.com' } }]),
                count: jest.fn().mockResolvedValue(1),
                findUnique: jest.fn().mockResolvedValue({ id: 'p1', status: 'IN_PROGRESS' }),
            },
        };
        mockPrismaWrite = {
            project: { update: jest.fn().mockResolvedValue({ id: 'p1', status: 'COMPLETED', updatedAt: new Date() }) },
            $transaction: jest.fn().mockImplementation(async (fn) => {
                const tx = {
                    project: { update: jest.fn().mockResolvedValue({ id: 'p1', status: 'COMPLETED', projectId: 'p1', updatedAt: new Date() }) },
                    outbox: { create: jest.fn().mockResolvedValue({}) },
                };
                return fn(tx);
            }),
        };
        service = new ProjectsAdminService(mockPrismaWrite, mockPrismaRead);
    });

    describe('listProjects', () => {
        it('should return paginated projects', async () => {
            const result = await service.listProjects(1, 10);
            expect(result.data).toHaveLength(1);
            expect(result.pagination.total).toBe(1);
        });
    });

    describe('updateProjectStatus', () => {
        it('should update status with outbox event', async () => {
            const result = await service.updateProjectStatus('p1', 'admin-1', { status: 'completed', reason: 'Done' } as any);
            expect(result.projectId).toBe('p1');
            expect(mockPrismaWrite.$transaction).toHaveBeenCalled();
        });

        it('should throw for non-existent project', async () => {
            mockPrismaRead.project.findUnique.mockResolvedValue(null);
            await expect(service.updateProjectStatus('invalid', 'admin-1', { status: 'completed' } as any))
                .rejects.toThrow();
        });
    });

    describe('updateProject', () => {
        it('should update project data', async () => {
            await service.updateProject('p1', { title: 'New Title' } as any);
            expect(mockPrismaWrite.project.update).toHaveBeenCalledWith({
                where: { id: 'p1' }, data: { title: 'New Title' },
            });
        });

        it('should throw for non-existent project', async () => {
            mockPrismaRead.project.findUnique.mockResolvedValue(null);
            await expect(service.updateProject('invalid', {} as any)).rejects.toThrow();
        });
    });
});
