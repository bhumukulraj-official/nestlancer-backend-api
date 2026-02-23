import { Injectable, NotFoundException, InternalServerErrorException } from '@nestjs/common';
import { PrismaWriteService, PrismaReadService } from '@nestlancer/database';
import { QueueProducerService } from '@nestlancer/queue';
import { CreateBackupDto } from '../dto/create-backup.dto';
import { RestoreBackupDto } from '../dto/restore-backup.dto';

@Injectable()
export class BackupsService {
    constructor(
        private readonly prismaWrite: PrismaWriteService,
        private readonly prismaRead: PrismaReadService,
        private readonly queueService: QueueProducerService,
    ) { }

    async createBackup(dto: CreateBackupDto, adminId: string) {
        try {
            const backup = await this.prismaWrite.backup.create({
                data: {
                    description: dto.description || `Manual backup by ${adminId}`,
                    type: 'FULL',
                    status: 'IN_PROGRESS',
                    startedAt: new Date(),
                    initiatedBy: adminId,
                },
            });

            await this.queueService.publish('admin', 'DATABASE_BACKUP_CREATE', {
                backupId: backup.id,
            });

            return backup;
        } catch (err) {
            throw new InternalServerErrorException({
                code: 'ADMIN_011',
                message: 'Backup creation failed to initiate',
            });
        }
    }

    async findAll() {
        return this.prismaRead.backup.findMany({
            orderBy: { startedAt: 'desc' },
        });
    }

    async findOne(id: string) {
        const backup = await this.prismaRead.backup.findUnique({ where: { id } });
        if (!backup) throw new NotFoundException('Backup not found');
        return backup;
    }

    async restoreBackup(dto: RestoreBackupDto, adminId: string) {
        const backup = await this.findOne(dto.backupId);
        if (backup.status !== 'COMPLETED') {
            throw new InternalServerErrorException({
                code: 'ADMIN_012',
                message: 'Cannot restore an incomplete backup',
            });
        }

        // In actual implementation, trigger careful background restore process
        await this.queueService.publish('admin', 'DATABASE_BACKUP_RESTORE', {
            backupId: backup.id,
            adminId,
        });

        return { success: true, message: 'Restore process initiated' };
    }

    async getDownloadUrl(id: string) {
        const backup = await this.findOne(id);
        if (backup.status !== 'COMPLETED' || !backup.s3Key) {
            throw new NotFoundException('Backup not ready or file missing');
        }
        // Generate signed S3 URL here
        const url = `https://mock-s3-bucket.s3.amazonaws.com/${backup.s3Key}?signed=true`;
        return { downloadUrl: url };
    }
}
