import { Test, TestingModule } from '@nestjs/testing';
import { MaintenanceModeService } from '../../../src/services/maintenance-mode.service';
import { SystemConfigService } from '../../../src/services/system-config.service';
import { CacheService } from '@nestlancer/cache';
import { ToggleMaintenanceDto } from '../../../src/dto/toggle-maintenance.dto';
import { BadRequestException } from '@nestjs/common';

describe('MaintenanceModeService', () => {
    let service: MaintenanceModeService;
    let configService: jest.Mocked<SystemConfigService>;
    let cacheService: jest.Mocked<CacheService>;

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            providers: [
                MaintenanceModeService,
                {
                    provide: SystemConfigService,
                    useValue: {
                        get: jest.fn(),
                        set: jest.fn(),
                    },
                },
                {
                    provide: CacheService,
                    useValue: {},
                },
            ],
        }).compile();

        service = module.get<MaintenanceModeService>(MaintenanceModeService);
        configService = module.get(SystemConfigService);
        cacheService = module.get(CacheService);
    });

    it('should be defined', () => {
        expect(service).toBeDefined();
    });

    describe('getStatus', () => {
        it('should return config from SystemConfigService', async () => {
            const mockConfig = { enabled: true, message: 'Maintenance' };
            configService.get.mockResolvedValue(mockConfig);

            const result = await service.getStatus();
            expect(configService.get).toHaveBeenCalledWith('MAINTENANCE_MODE');
            expect(result).toEqual(mockConfig);
        });

        it('should return default config if configService fails', async () => {
            configService.get.mockRejectedValue(new Error('not found'));

            const result = await service.getStatus();
            expect(result).toEqual({ enabled: false });
        });
    });

    describe('toggle', () => {
        it('should toggle and set new config', async () => {
            jest.spyOn(service, 'getStatus').mockResolvedValue({ enabled: false } as any);
            const dto: ToggleMaintenanceDto = { enabled: true, message: 'Updating' };
            configService.set.mockResolvedValue(undefined);

            const result = await service.toggle(dto, 'admin1');

            expect(configService.set).toHaveBeenCalledWith(
                { key: 'MAINTENANCE_MODE', value: expect.objectContaining({ enabled: true, message: 'Updating' }) },
                'admin1'
            );
            expect(result.enabled).toBe(true);
            expect(result.message).toBe('Updating');
        });

        it('should throw BadRequestException if status is already in the requested state', async () => {
            jest.spyOn(service, 'getStatus').mockResolvedValue({ enabled: true } as any);
            const dto: ToggleMaintenanceDto = { enabled: true };

            await expect(service.toggle(dto, 'admin1')).rejects.toThrow(BadRequestException);
        });
    });
});
