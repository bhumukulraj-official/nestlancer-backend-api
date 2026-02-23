import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaWriteService, PrismaReadService } from '@nestlancer/database';
import { QueueProducerService } from '@nestlancer/queue';
import { UpdateEmailTemplateDto } from '../dto/update-email-template.dto';

@Injectable()
export class EmailTemplatesService {
    constructor(
        private readonly prismaWrite: PrismaWriteService,
        private readonly prismaRead: PrismaReadService,
        private readonly queueService: QueueProducerService,
    ) { }

    async findAll() {
        return this.prismaRead.emailTemplate.findMany();
    }

    async findOne(id: string) {
        const template = await this.prismaRead.emailTemplate.findUnique({ where: { id } });
        if (!template) throw new NotFoundException('Template not found');
        return template;
    }

    async update(id: string, dto: UpdateEmailTemplateDto) {
        await this.findOne(id); // Ensure exists
        return this.prismaWrite.emailTemplate.update({
            where: { id },
            data: {
                subject: dto.subject,
                htmlBody: dto.body,
            },
        });
    }

    async sendTestEmail(id: string, email: string) {
        const template = await this.findOne(id);
        await this.queueService.publish('email', 'TEMPLATE_TEST', {
            to: email,
            templateId: template.id,
            mockData: true,
        });
        return { success: true, message: `Test email queued for ${email}` };
    }
}
