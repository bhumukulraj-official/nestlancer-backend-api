import { Injectable } from '@nestjs/common';
import { PrismaWriteService, PrismaReadService, ReadOnly } from '@nestlancer/database';
import { CreateNotificationTemplateDto } from '../dto/create-notification-template.dto';
import { UpdateNotificationTemplateDto } from '../dto/update-notification-template.dto';

@Injectable()
export class NotificationTemplatesService {
    constructor(
        private readonly prismaWrite: PrismaWriteService,
        private readonly prismaRead: PrismaReadService,
    ) { }

    @ReadOnly()
    async findAll() {
        return this.prismaRead.notificationTemplate.findMany();
    }

    async create(dto: CreateNotificationTemplateDto) {
        return this.prismaWrite.notificationTemplate.create({
            data: dto as any, // Cast for placeholder purposes
        });
    }

    async update(id: string, dto: UpdateNotificationTemplateDto) {
        return this.prismaWrite.notificationTemplate.update({
            where: { id },
            data: dto as any,
        });
    }

    async delete(id: string) {
        return this.prismaWrite.notificationTemplate.delete({
            where: { id }
        });
    }
}
