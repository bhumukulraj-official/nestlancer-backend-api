import { Test, TestingModule } from '@nestjs/testing';
import { MediaAdminController } from '../../../src/media/media.admin.controller';
import { MediaAdminService } from '../../../src/media/media-admin.service';
import { QueryMediaDto } from '../../../src/dto/query-media.dto';

describe('MediaAdminController', () => {
    let controller: MediaAdminController;
    let adminService: jest.Mocked<MediaAdminService>;

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            controllers: [MediaAdminController],
            providers: [
                {
                    provide: MediaAdminService,
                    useValue: {
                        findAll: jest.fn(),
                        findQuarantined: jest.fn(),
                        getAnalytics: jest.fn(),
                        findById: jest.fn(),
                        reprocess: jest.fn(),
                        deleteAny: jest.fn(),
                        releaseQuarantined: jest.fn(),
                    },
                },
            ],
        }).compile();

        controller = module.get<MediaAdminController>(MediaAdminController);
        adminService = module.get(MediaAdminService);
    });

    it('should be defined', () => {
        expect(controller).toBeDefined();
    });

    describe('getAllMedia', () => {
        it('should call adminService.findAll', async () => {
            adminService.findAll.mockResolvedValue({ data: [], total: 0 } as any);
            const query = new QueryMediaDto();

            const result = await controller.getAllMedia(query);

            expect(adminService.findAll).toHaveBeenCalledWith(query);
            expect(result).toEqual({ data: [], total: 0 });
        });
    });

    describe('getQuarantinedMedia', () => {
        it('should call adminService.findQuarantined', async () => {
            adminService.findQuarantined.mockResolvedValue({ data: [], total: 0 } as any);
            const query = new QueryMediaDto();

            const result = await controller.getQuarantinedMedia(query);

            expect(adminService.findQuarantined).toHaveBeenCalledWith(query);
            expect(result).toEqual({ data: [], total: 0 });
        });
    });

    describe('getStorageAnalytics', () => {
        it('should call adminService.getAnalytics', async () => {
            adminService.getAnalytics.mockResolvedValue({ totalBytes: 0 } as any);

            const result = await controller.getStorageAnalytics();

            expect(adminService.getAnalytics).toHaveBeenCalled();
            expect(result).toEqual({ totalBytes: 0 });
        });
    });

    describe('getMediaDetails', () => {
        it('should call adminService.findById', async () => {
            adminService.findById.mockResolvedValue({ id: '1' } as any);

            const result = await controller.getMediaDetails('1');

            expect(adminService.findById).toHaveBeenCalledWith('1');
            expect(result).toEqual({ id: '1' });
        });
    });

    describe('reprocessMedia', () => {
        it('should call adminService.reprocess', async () => {
            adminService.reprocess.mockResolvedValue({ status: 'PROCESSING' } as any);

            const result = await controller.reprocessMedia('1');

            expect(adminService.reprocess).toHaveBeenCalledWith('1');
            expect(result).toEqual({ status: 'PROCESSING' });
        });
    });

    describe('deleteMedia', () => {
        it('should call adminService.deleteAny', async () => {
            adminService.deleteAny.mockResolvedValue({ deleted: true } as any);

            const result = await controller.deleteMedia('1');

            expect(adminService.deleteAny).toHaveBeenCalledWith('1');
            expect(result).toEqual({ deleted: true });
        });
    });

    describe('releaseQuarantinedMedia', () => {
        it('should call adminService.releaseQuarantined', async () => {
            adminService.releaseQuarantined.mockResolvedValue({ status: 'READY' } as any);

            const result = await controller.releaseQuarantinedMedia('1');

            expect(adminService.releaseQuarantined).toHaveBeenCalledWith('1');
            expect(result).toEqual({ status: 'READY' });
        });
    });
});
