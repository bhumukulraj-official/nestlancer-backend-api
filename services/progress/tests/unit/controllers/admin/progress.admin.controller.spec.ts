import { Test, TestingModule } from '@nestjs/testing';
import { ProgressAdminController } from '../../../../src/controllers/admin/progress.admin.controller';
import { ProgressService } from '../../../../src/services/progress.service';
import { CreateProgressEntryDto } from '../../../../src/dto/create-progress-entry.dto';
import { UpdateProgressEntryDto } from '../../../../src/dto/update-progress-entry.dto';

describe('ProgressAdminController', () => {
    let controller: ProgressAdminController;
    let progressService: jest.Mocked<ProgressService>;

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            controllers: [ProgressAdminController],
            providers: [
                {
                    provide: ProgressService,
                    useValue: {
                        createEntry: jest.fn(),
                        getProjectProgress: jest.fn(),
                        updateEntry: jest.fn(),
                        deleteEntry: jest.fn(),
                    },
                },
            ],
        }).compile();

        controller = module.get<ProgressAdminController>(ProgressAdminController);
        progressService = module.get(ProgressService);
    });

    it('should be defined', () => {
        expect(controller).toBeDefined();
    });

    describe('createProgressEntry', () => {
        it('should create progress entry', async () => {
            progressService.createEntry.mockResolvedValue({ id: 'e1' } as any);
            const dto = new CreateProgressEntryDto();

            const result = await controller.createProgressEntry('p1', 'admin1', dto);

            expect(progressService.createEntry).toHaveBeenCalledWith('admin1', 'p1', dto);
            expect(result).toEqual({ status: 'success', data: { id: 'e1' } });
        });
    });

    describe('getProjectProgress', () => {
        it('should list project progress', async () => {
            progressService.getProjectProgress.mockResolvedValue({ items: [] } as any);

            const result = await controller.getProjectProgress('p1', { page: 1 });

            expect(progressService.getProjectProgress).toHaveBeenCalledWith('p1', { page: 1 });
            expect(result).toEqual({ status: 'success', items: [] });
        });
    });

    describe('updateProgressEntry', () => {
        it('should update progress entry', async () => {
            progressService.updateEntry.mockResolvedValue({ id: 'e1' } as any);
            const dto = new UpdateProgressEntryDto();

            const result = await controller.updateProgressEntry('e1', dto);

            expect(progressService.updateEntry).toHaveBeenCalledWith('e1', dto);
            expect(result).toEqual({ status: 'success', data: { id: 'e1' } });
        });
    });

    describe('deleteProgressEntry', () => {
        it('should delete progress entry', async () => {
            progressService.deleteEntry.mockResolvedValue(undefined);

            const result = await controller.deleteProgressEntry('e1');

            expect(progressService.deleteEntry).toHaveBeenCalledWith('e1');
            expect(result).toEqual({ status: 'success' });
        });
    });
});
