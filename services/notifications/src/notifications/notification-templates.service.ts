import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaWriteService, PrismaReadService, ReadOnly } from '@nestlancer/database';
import { CreateNotificationTemplateDto } from '../dto/create-notification-template.dto';
import { UpdateNotificationTemplateDto } from '../dto/update-notification-template.dto';

interface NotificationTemplateResponse {
  id: string;
  name: string;
  eventType: string;
  titleTemplate: string;
  messageTemplate: string;
  channels: Record<string, unknown>;
  priority: string;
  isActive: boolean;
  variables?: Record<string, unknown>;
  createdAt: Date;
  updatedAt: Date;
}

@Injectable()
export class NotificationTemplatesService {
  constructor(
    private readonly prismaWrite: PrismaWriteService,
    private readonly prismaRead: PrismaReadService,
  ) {}

  @ReadOnly()
  async findAll(): Promise<NotificationTemplateResponse[]> {
    const templates = await this.prismaRead.notificationTemplate.findMany({
      orderBy: { name: 'asc' },
    });
    return templates.map(this.formatTemplateResponse);
  }

  @ReadOnly()
  async findByEventType(eventType: string): Promise<NotificationTemplateResponse | null> {
    const template = await this.prismaRead.notificationTemplate.findFirst({
      where: { eventType, isActive: true },
    });
    return template ? this.formatTemplateResponse(template) : null;
  }

  @ReadOnly()
  async findById(id: string): Promise<NotificationTemplateResponse> {
    const template = await this.prismaRead.notificationTemplate.findUnique({
      where: { id },
    });
    if (!template) {
      throw new NotFoundException(`Notification template with ID ${id} not found`);
    }
    return this.formatTemplateResponse(template);
  }

  async create(dto: CreateNotificationTemplateDto): Promise<NotificationTemplateResponse> {
    const template = await this.prismaWrite.notificationTemplate.create({
      data: {
        name: dto.name,
        eventType: dto.eventType,
        titleTemplate: dto.channels?.title || dto.name,
        messageTemplate: dto.channels?.message || '',
        channels: dto.channels,
        priority: 'NORMAL',
        isActive: true,
      },
    });
    return this.formatTemplateResponse(template);
  }

  async update(
    id: string,
    dto: UpdateNotificationTemplateDto,
  ): Promise<NotificationTemplateResponse> {
    // Verify template exists
    await this.findById(id);

    const updateData: Record<string, unknown> = {};
    if (dto.name !== undefined) updateData.name = dto.name;
    if (dto.eventType !== undefined) updateData.eventType = dto.eventType;
    if (dto.channels !== undefined) {
      updateData.channels = dto.channels;
      if (dto.channels.title) updateData.titleTemplate = dto.channels.title;
      if (dto.channels.message) updateData.messageTemplate = dto.channels.message;
    }

    const template = await this.prismaWrite.notificationTemplate.update({
      where: { id },
      data: updateData,
    });
    return this.formatTemplateResponse(template);
  }

  async delete(id: string): Promise<void> {
    // Verify template exists
    await this.findById(id);

    await this.prismaWrite.notificationTemplate.delete({
      where: { id },
    });
  }

  async toggleActive(id: string): Promise<NotificationTemplateResponse> {
    const existing = await this.findById(id);
    const template = await this.prismaWrite.notificationTemplate.update({
      where: { id },
      data: { isActive: !existing.isActive },
    });
    return this.formatTemplateResponse(template);
  }

  private formatTemplateResponse(template: any): NotificationTemplateResponse {
    return {
      id: template.id,
      name: template.name,
      eventType: template.eventType,
      titleTemplate: template.titleTemplate,
      messageTemplate: template.messageTemplate,
      channels: template.channels as Record<string, unknown>,
      priority: template.priority,
      isActive: template.isActive,
      variables: template.variables as Record<string, unknown> | undefined,
      createdAt: template.createdAt,
      updatedAt: template.updatedAt,
    };
  }
}
