import { Test, TestingModule } from '@nestjs/testing';
import { DeliverablesAdminController } from '../../../../src/controllers/admin/deliverables.admin.controller';
import { DeliverablesService } from '../../../../src/services/deliverables.service';
import { UploadDeliverableDto } from '../../../../src/dto/upload-deliverable.dto';
import { UpdateDeliverableDto } from '../../../../src/dto/update-deliverable.dto';

describe('DeliverablesAdminController', () => {
    let controller: DeliverablesAdminController;
    let deliverablesService: jest.Mocked<DeliverablesService>;

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            controllers: [DeliverablesAdminController],
            providers: [
                {
                    provide: DeliverablesService,
                    useValue: {
                        create: jest.fn(),
                        getProjectDeliverables: jest.fn(),
                        update: jest.fn(),
                        delete: jest.fn(),
                    },
                },
            ],
        }).compile();

        controller = module.get<DeliverablesAdminController>(DeliverablesAdminController);
        deliverablesService = module.get(DeliverablesService);
    });

    it('should be defined', () => {
        expect(controller).toBeDefined();
    });

    describe('uploadDeliverable', () => {
        it('should create a deliverable', async () => {
            deliverablesService.create.mockResolvedValue({ id: 'd1' } as any);
            const dto: UploadDeliverableDto = { title: 'Test', milestoneId: 'm1', fileUrl: 'url' };

            const result = await controller.uploadDeliverable('p1', dto);

            expect(deliverablesService.create).toHaveBeenCalledWith('p1', dto);
            expect(result).toEqual({ status: 'success', data: { id: 'd1' } });
        });
    });

    describe('getProjectDeliverables', () => {
        it('should list project deliverables', async () => {
            deliverablesService.getProjectDeliverables.mockResolvedValue([{ id: 'd1' }] as any);

            const result = await controller.getProjectDeliverables('p1');

            expect(deliverablesService.getProjectDeliverables).toHaveBeenCalledWith('p1');
            expect(result).toEqual({ status: 'success', data: [{ id: 'd1' }] });
        });
    });

    describe('updateDeliverable', () => {
        it('should update a deliverable', async () => {
            deliverablesService.update.mockResolvedValue({ id: 'd1', title: 'New' } as any);
            const dto: UpdateDeliverableDto = { title: 'New' };

            const result = await controller.updateDeliverable('d1', dto);

            expect(deliverablesService.update).toHaveBeenCalledWith('d1', dto);
            expect(result).toEqual({ status: 'success', data: { id: 'd1', title: 'New' } });
        });
    });

    describe('deleteDeliverable', () => {
        it('should delete a deliverable', async () => {
            deliverablesService.delete.mockResolvedValue(undefined);

            const result = await controller.deleteDeliverable('d1');

            expect(deliverablesService.delete).toHaveBeenCalledWith('d1');
            expect(result).toEqual({ status: 'success' });
        });
    });
});
