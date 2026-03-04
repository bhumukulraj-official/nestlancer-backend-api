import { Test, TestingModule } from '@nestjs/testing';
import { ProjectsAdminController } from '../../../src/controllers/projects.admin.controller';
import { ProjectsAdminService } from '../../../src/services/projects.admin.service';
import { JwtAuthGuard, RolesGuard } from '@nestlancer/auth-lib';

describe('ProjectsAdminController', () => {
    let controller: ProjectsAdminController;
    let adminService: jest.Mocked<ProjectsAdminService>;

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            controllers: [ProjectsAdminController],
            providers: [
                {
                    provide: ProjectsAdminService,
                    useValue: {
                        listProjects: jest.fn(),
                        updateProjectStatus: jest.fn(),
                        updateProject: jest.fn(),
                    },
                },
            ],
        })
            .overrideGuard(JwtAuthGuard)
            .useValue({ canActivate: () => true })
            .overrideGuard(RolesGuard)
            .useValue({ canActivate: () => true })
            .compile();

        controller = module.get<ProjectsAdminController>(ProjectsAdminController);
        adminService = module.get(ProjectsAdminService);
    });

    it('should be defined', () => {
        expect(controller).toBeDefined();
    });

    describe('listProjects', () => {
        it('should call listProjects with parsed pagination options', () => {
            adminService.listProjects.mockResolvedValue([] as any);

            const result = controller.listProjects('2', '10');

            expect(adminService.listProjects).toHaveBeenCalledWith(2, 10);
            expect(result).resolves.toEqual([]);
        });

        it('should use default pagination options', () => {
            adminService.listProjects.mockResolvedValue([] as any);
            controller.listProjects(undefined, undefined);
            expect(adminService.listProjects).toHaveBeenCalledWith(1, 20);
        });
    });

    describe('updateProjectStatus', () => {
        it('should call updateProjectStatus on service', () => {
            adminService.updateProjectStatus.mockResolvedValue({ id: 'p1' } as any);
            const dto = { status: 'ACTIVE' } as any;

            const result = controller.updateProjectStatus('p1', 'admin1', dto);

            expect(adminService.updateProjectStatus).toHaveBeenCalledWith('p1', 'admin1', dto);
            expect(result).resolves.toEqual({ id: 'p1' });
        });
    });

    describe('updateProject', () => {
        it('should call updateProject on service', () => {
            adminService.updateProject.mockResolvedValue({ id: 'p1' } as any);
            const dto = { title: 'New' } as any;

            const result = controller.updateProject('p1', dto);

            expect(adminService.updateProject).toHaveBeenCalledWith('p1', dto);
            expect(result).resolves.toEqual({ id: 'p1' });
        });
    });
});
