import { Test, TestingModule } from '@nestjs/testing';
import { BackupSchedulerService } from '../../../src/services/backup-scheduler.service';
import { PrismaWriteService, PrismaReadService } from '@nestlancer/database';
import { UpdateBackupScheduleDto } from '../../../src/dto/update-backup-schedule.dto';

describe('BackupSchedulerService', () => {
    let service: BackupSchedulerService;
    let prismaWrite: jest.Mocked<PrismaWriteService>;
    let prismaRead: jest.Mocked<PrismaReadService>;

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            providers: [
                BackupSchedulerService,
                {
                    provide: PrismaWriteService,
                    useValue: {
                        backupSchedule: {
                            update: jest.fn(),
                            create: jest.fn(),
                        },
                    },
                },
                {
                    provide: PrismaReadService,
                    useValue: {
                        backupSchedule: {
                            findFirst: jest.fn(),
                        },
                    },
                },
            ],
        }).compile();

        service = module.get<BackupSchedulerService>(BackupSchedulerService);
        prismaWrite = module.get(PrismaWriteService);
        prismaRead = module.get(PrismaReadService);
    });

    it('should be defined', () => {
        expect(service).toBeDefined();
    });

    describe('getSchedule', () => {
        it('should return the existing schedule if found', async () => {
            const mockSchedule = { id: '1', cronExpression: '0 0 * * *', retentionDays: 7, enabled: true };
            prismaRead.backupSchedule.findFirst.mockResolvedValue(mockSchedule as any);

            const result = await service.getSchedule();

            expect(prismaRead.backupSchedule.findFirst).toHaveBeenCalled();
            expect(result).toEqual(mockSchedule);
        });

        it('should return a default schedule if not found', async () => {
            prismaRead.backupSchedule.findFirst.mockResolvedValue(null);

            const result = await service.getSchedule();

            expect(prismaRead.backupSchedule.findFirst).toHaveBeenCalled();
            expect(result).toEqual({ cronExpression: '0 0 * * *', retentionDays: 30, enabled: true });
        });
    });

    describe('updateSchedule', () => {
        it('should update the schedule if it already exists', async () => {
            const existingSchedule = { id: '1' };
            prismaRead.backupSchedule.findFirst.mockResolvedValue(existingSchedule as any);
            const updateData: UpdateBackupScheduleDto = { cronExpression: '0 12 * * *', retentionDays: 14 };
            const updatedSchedule = { ...existingSchedule, ...updateData };
            prismaWrite.backupSchedule.update.mockResolvedValue(updatedSchedule as any);

            const result = await service.updateSchedule(updateData);

            expect(prismaRead.backupSchedule.findFirst).toHaveBeenCalled();
            expect(prismaWrite.backupSchedule.update).toHaveBeenCalledWith({
                where: { id: existingSchedule.id },
                data: expect.objectContaining({
                    cronExpression: updateData.cronExpression,
                    retentionDays: updateData.retentionDays,
                }),
            });
            expect(result).toEqual(updatedSchedule);
        });

        it('should create a new schedule if it does not exist', async () => {
            prismaRead.backupSchedule.findFirst.mockResolvedValue(null);
            const updateData: UpdateBackupScheduleDto = { cronExpression: '0 12 * * *', retentionDays: 14 };
            const createdSchedule = { id: '1', ...updateData, enabled: true };
            prismaWrite.backupSchedule.create.mockResolvedValue(createdSchedule as any);

            const result = await service.updateSchedule(updateData);

            expect(prismaRead.backupSchedule.findFirst).toHaveBeenCalled();
            expect(prismaWrite.backupSchedule.create).toHaveBeenCalledWith({
                data: expect.objectContaining({
                    cronExpression: updateData.cronExpression,
                    retentionDays: updateData.retentionDays,
                    enabled: true,
                }),
            });
            expect(result).toEqual(createdSchedule);
        });
    });
});
