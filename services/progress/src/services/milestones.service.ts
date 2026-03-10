import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaWriteService, PrismaReadService } from '@nestlancer/database';
import { CreateMilestoneDto } from '../dto/create-milestone.dto';
import { UpdateMilestoneDto } from '../dto/update-milestone.dto';
import { OutboxService } from '@nestlancer/outbox';

@Injectable()
export class MilestonesService {
  constructor(
    private readonly prismaWrite: PrismaWriteService,
    private readonly prismaRead: PrismaReadService,
    private readonly outbox: OutboxService,
  ) {}

  async create(projectId: string, dto: CreateMilestoneDto) {
    const defaultOrder = dto.order ?? (await this.getNextOrder(projectId));

    const milestone = await this.prismaWrite.milestone.create({
      data: {
        projectId,
        name: dto.name,
        description: dto.description,
        startDate: new Date(dto.startDate),
        endDate: new Date(dto.endDate),
        order: defaultOrder,
        status: 'PENDING',
      },
    });

    return milestone;
  }

  async update(id: string, dto: UpdateMilestoneDto) {
    const milestone = await this.prismaWrite.milestone.update({
      where: { id },
      data: {
        name: dto.name,
        description: dto.description,
        startDate: dto.startDate ? new Date(dto.startDate) : undefined,
        endDate: dto.endDate ? new Date(dto.endDate) : undefined,
        order: dto.order,
      },
    });
    return milestone;
  }

  async complete(id: string) {
    const milestone = await this.prismaRead.milestone.findUnique({ where: { id } });
    if (!milestone) throw new NotFoundException('Milestone not found');

    const updated = await this.prismaWrite.$transaction(async (tx: any) => {
      const ms = await tx.milestone.update({
        where: { id },
        data: {
          status: 'COMPLETED',
          completedAt: new Date(),
        },
      });

      await tx.outbox.create({
        data: {
          eventType: 'MILESTONE_COMPLETED',
          payload: {
            milestoneId: id,
            projectId: ms.projectId,
            name: ms.name,
          },
        },
      });

      return ms;
    });

    return updated;
  }

  private async getNextOrder(projectId: string): Promise<number> {
    const last = await this.prismaRead.milestone.findFirst({
      where: { projectId },
      orderBy: { order: 'desc' },
    });
    return last ? last.order + 1 : 1;
  }
}
