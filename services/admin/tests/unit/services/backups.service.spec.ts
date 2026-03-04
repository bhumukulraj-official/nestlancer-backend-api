import { Test, TestingModule } from '@nestjs/testing';
import { BackupsService } from '../../../src/services/backups.service';
import { PrismaWriteService, PrismaReadService } from '@nestlancer/database';
import { QueuePublisherService } from '@nestlancer/queue';
import { StorageService } from '@nestlancer/storage';
import { NotFoundException, InternalServerErrorException } from '@nestjs/common';
import { CreateBackupDto } from '../../../src/dto/create-backup.dto';
import { RestoreBackupDto } from '../../../src/dto/restore-backup.dto';

describe('BackupsService', () => {
    let service: BackupsService;
    let prismaWrite: jest.Mocked<PrismaWriteService>;
    let prismaRead: jest.Mocked<PrismaReadService>;
    let queueService: jest.Mocked<QueuePublisherService>;
    let storageService: jest.Mocked<StorageService>;

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            providers: [
                BackupsService,
                {
                    provide: PrismaWriteService,
                    useValue: {
                        backup: {
                            create: jest.fn(),
                        },
                    },
                },
                {
                    provide: PrismaReadService,
                    useValue: {
                        backup: {
                            findMany: jest.fn(),
                            findUnique: jest.fn(),
                        },
                    },
                },
                {
                    provide: QueuePublisherService,
                    useValue: {
                        publish: jest.fn(),
                    },
                },
                {
                    provide: StorageService,
                    useValue: {
                        getSignedUrl: jest.fn(),
                    },
                },
            ],
        }).compile();

        service = module.get<BackupsService>(BackupsService);
        prismaWrite = module.get(PrismaWriteService);
        prismaRead = module.get(PrismaReadService);
        queueService = module.get(QueuePublisherService);
        storageService = module.get(StorageService);
    });

    it('should be defined', () => {
        expect(service).toBeDefined();
    });

    describe('createBackup', () => {
        it('should create a backup and publish a queue message', async () => {
            const dto: CreateBackupDto = { description: 'Test Backup' };
            const mockBackup = { id: 'backup1', ...dto };
            prismaWrite.backup.create.mockResolvedValue(mockBackup as any);
            queueService.publish.mockResolvedValue(undefined as any);

            const result = await service.createBackup(dto, 'admin1');

            expect(prismaWrite.backup.create).toHaveBeenCalled();
            expect(queueService.publish).toHaveBeenCalledWith('admin', 'DATABASE_BACKUP_CREATE', { backupId: mockBackup.id });
            expect(result).toEqual(mockBackup);
        });

        it('should throw Error if creation fails', async () => {
            prismaWrite.backup.create.mockRejectedValue(new Error('DB Error'));

            await expect(service.createBackup({}, 'admin1')).rejects.toThrow(InternalServerErrorException);
        });
    });

    describe('findAll', () => {
        it('should return all backups', async () => {
            const mockBackups = [{ id: '1' }, { id: '2' }];
            prismaRead.backup.findMany.mockResolvedValue(mockBackups as any);

            const result = await service.findAll();

            expect(prismaRead.backup.findMany).toHaveBeenCalled();
            expect(result).toEqual(mockBackups);
        });
    });

    describe('findOne', () => {
        it('should return a backup if found', async () => {
            const mockBackup = { id: '1' };
            prismaRead.backup.findUnique.mockResolvedValue(mockBackup as any);

            const result = await service.findOne('1');

            expect(prismaRead.backup.findUnique).toHaveBeenCalledWith({ where: { id: '1' } });
            expect(result).toEqual(mockBackup);
        });

        it('should throw NotFoundException if not found', async () => {
            prismaRead.backup.findUnique.mockResolvedValue(null);

            await expect(service.findOne('99')).rejects.toThrow(NotFoundException);
        });
    });

    describe('restoreBackup', () => {
        it('should publish restore message if backup is COMPLETED', async () => {
            const mockBackup = { id: '1', status: 'COMPLETED' };
            jest.spyOn(service, 'findOne').mockResolvedValue(mockBackup as any);
            queueService.publish.mockResolvedValue(undefined as any);

            const dto: RestoreBackupDto = { backupId: '1' };
            const result = await service.restoreBackup(dto, 'admin1');

            expect(service.findOne).toHaveBeenCalledWith('1');
            expect(queueService.publish).toHaveBeenCalledWith('admin', 'DATABASE_BACKUP_RESTORE', { backupId: '1', adminId: 'admin1' });
            expect(result).toEqual({ success: true, message: 'Restore process initiated' });
        });

        it('should throw InternalServerErrorException if backup is not COMPLETED', async () => {
            const mockBackup = { id: '1', status: 'IN_PROGRESS' };
            jest.spyOn(service, 'findOne').mockResolvedValue(mockBackup as any);

            const dto: RestoreBackupDto = { backupId: '1' };
            await expect(service.restoreBackup(dto, 'admin1')).rejects.toThrow(InternalServerErrorException);
        });
    });

    describe('getDownloadUrl', () => {
        it('should return download url if COMPLETED and has srcKey', async () => {
            const mockBackup = { id: '1', status: 'COMPLETED', s3Key: 'somekey' };
            jest.spyOn(service, 'findOne').mockResolvedValue(mockBackup as any);
            const mockUrl = 'http://download.url';
            storageService.getSignedUrl.mockResolvedValue(mockUrl as any);

            const result = await service.getDownloadUrl('1');

            expect(service.findOne).toHaveBeenCalledWith('1');
            expect(storageService.getSignedUrl).toHaveBeenCalledWith({
                bucket: 'nestlancer-private',
                key: 'somekey',
                expiresIn: 3600
            });
            expect(result).toEqual({ downloadUrl: mockUrl });
        });

        it('should throw NotFoundException if not COMPLETED or no s3Key', async () => {
            const mockBackup = { id: '1', status: 'IN_PROGRESS' };
            jest.spyOn(service, 'findOne').mockResolvedValue(mockBackup as any);

            await expect(service.getDownloadUrl('1')).rejects.toThrow(NotFoundException);
        });
    });
});
