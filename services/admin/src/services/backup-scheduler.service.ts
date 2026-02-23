import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaWriteService, PrismaReadService } from '@nestlancer/database';
import { UpdateBackupScheduleDto } from '../dto/update-backup-schedule.dto';

@Injectable()
export class BackupSchedulerService {
    constructor(
        private readonly prismaWrite: PrismaWriteService,
        private readonly prismaRead: PrismaReadService,
    ) { }

    async getSchedule() {
        // Assuming single global schedule record
        const schedule = await this.prismaRead.backupSchedule.findFirst();
        return schedule || { cronExpression: '0 0 * * *', retentionDays: 30, enabled: true };
    }

    async updateSchedule(dto: UpdateBackupScheduleDto) {
        const existing = await this.prismaRead.backupSchedule.findFirst();
        if (existing) {
            return this.prismaWrite.backupSchedule.update({
                where: { id: existing.id },
                data: {
                    cronExpression: dto.cronExpression,
                    retentionDays: dto.retentionDays,
                    updatedAt: new Date(),
                },
            });
        } else {
            return this.prismaWrite.backupSchedule.create({
                data: {
                    cronExpression: dto.cronExpression,
                    retentionDays: dto.retentionDays,
                    enabled: true,
                    updatedAt: new Date(),
                },
            });
        }
    }
}
