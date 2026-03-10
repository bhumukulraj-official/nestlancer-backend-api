import { Injectable } from '@nestjs/common';
import { PrismaWriteService, PrismaReadService } from '@nestlancer/database';
import { BusinessLogicException } from '@nestlancer/common';
import { ApproveProjectDto } from '../dto/approve-project.dto';
import { RequestProjectRevisionDto } from '../dto/request-project-revision.dto';

@Injectable()
export class ProjectsService {
  constructor(
    private readonly prismaWrite: PrismaWriteService,
    private readonly prismaRead: PrismaReadService,
  ) {}

  async getMyProjects(userId: string) {
    const projects = await this.prismaRead.project.findMany({
      where: { clientId: userId },
      select: {
        id: true,
        title: true,
        status: true,
        createdAt: true,
        // Simplified view
      },
      orderBy: { createdAt: 'desc' },
    });

    return projects.map((p) => ({
      id: p.id,
      title: p.title,
      status: p.status.toLowerCase().replace(/_([a-z])/g, (g) => g[1].toUpperCase()),
      createdAt: p.createdAt,
    }));
  }

  async getUserStats(userId: string) {
    const projects = await this.prismaRead.project.findMany({
      where: { clientId: userId },
      select: { status: true },
    });

    const stats = { total: projects.length, active: 0, completed: 0, cancelled: 0 };
    for (const p of projects) {
      if (p.status === 'COMPLETED') stats.completed++;
      else if (p.status === 'CANCELLED') stats.cancelled++;
      else stats.active++;
    }

    return stats;
  }

  async getProjectDetails(userId: string, projectId: string) {
    const project = await this.prismaRead.project.findFirst({
      where: { id: projectId, clientId: userId },
      include: {
        quote: { select: { id: true, totalAmount: true, currency: true, acceptedAt: true } },
      },
    });

    if (!project) throw new BusinessLogicException('Project not found', 'PROJECT_001');

    return {
      id: project.id,
      title: project.title,
      description: project.description,
      status: project.status.toLowerCase().replace(/_([a-z])/g, (g) => g[1].toUpperCase()),
      quote: (project as any).quote,
      // Aggregating milestones, payments etc would be done here or in separate endpoint normally
      createdAt: project.createdAt,
      updatedAt: project.updatedAt,
    };
  }

  async approveProject(userId: string, projectId: string, dto: ApproveProjectDto) {
    const project = await this.prismaRead.project.findFirst({
      where: { id: projectId, clientId: userId },
    });

    if (!project) throw new BusinessLogicException('Project not found', 'PROJECT_001');
    if (project.status === 'COMPLETED')
      throw new BusinessLogicException('Project already completed', 'PROJECT_005');
    if (project.status !== 'REVIEW')
      throw new BusinessLogicException('Project not ready for approval', 'PROJECT_008');

    await this.prismaWrite.$transaction(async (tx: any) => {
      await tx.project.update({
        where: { id: projectId },
        data: {
          status: 'COMPLETED',
          completedAt: new Date(),
        },
      });

      // Save feedback logic here (e.g., to a separate Feedback table)
      await tx.outbox.create({
        data: {
          eventType: 'PROJECT_APPROVED',
          payload: { projectId, userId, rating: dto.rating },
        },
      });
    });

    return {
      projectId,
      status: 'completed',
      approvedAt: new Date(),
      rating: dto.rating,
    };
  }

  async requestRevision(userId: string, projectId: string, dto: RequestProjectRevisionDto) {
    const project = await this.prismaRead.project.findFirst({
      where: { id: projectId, clientId: userId },
    });

    if (!project) throw new BusinessLogicException('Project not found', 'PROJECT_001');
    if (project.status === 'COMPLETED')
      throw new BusinessLogicException('Cannot modify completed project', 'PROJECT_005');

    await this.prismaWrite.$transaction(async (tx: any) => {
      await tx.project.update({
        where: { id: projectId },
        data: { status: 'REVISION_REQUESTED' },
      });

      await tx.outbox.create({
        data: {
          eventType: 'PROJECT_REVISION_REQUESTED',
          payload: { projectId, userId, revisionDetails: dto },
        },
      });
    });

    return {
      projectId,
      status: 'revisionRequested',
      requestedAt: new Date(),
    };
  }
}
