import { Injectable } from '@nestjs/common';
import { PrismaWriteService, PrismaReadService } from '@nestlancer/database';
import { BusinessLogicException, ValidationException } from '@nestlancer/common';
import { UpdateProjectStatusAdminDto } from '../dto/update-project-status.admin.dto';
import { UpdateProjectAdminDto } from '../dto/update-project.admin.dto';

@Injectable()
export class ProjectsAdminService {
  constructor(
    private readonly prismaWrite: PrismaWriteService,
    private readonly prismaRead: PrismaReadService,
  ) {}

  async listProjects(page: number, limit: number) {
    const [projects, total] = await Promise.all([
      this.prismaRead.project.findMany({
        skip: (page - 1) * limit,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: { client: { select: { firstName: true, lastName: true, email: true } } },
      }),
      this.prismaRead.project.count(),
    ]);

    return {
      data: projects.map((p) => ({
        id: p.id,
        title: p.title,
        status: p.status.toLowerCase().replace(/_([a-z])/g, (g) => g[1].toUpperCase()),
        client: (p as any).client,
        createdAt: p.createdAt,
      })),
      pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
    };
  }

  async updateProjectStatus(projectId: string, adminId: string, dto: UpdateProjectStatusAdminDto) {
    const project = await this.prismaRead.project.findUnique({ where: { id: projectId } });
    if (!project) throw new BusinessLogicException('Project not found', 'PROJECT_001');

    const result = await this.prismaWrite.$transaction(async (tx: any) => {
      const updated = await tx.project.update({
        where: { id: projectId },
        data: { status: dto.status.toUpperCase() },
      });

      // Record status change event
      await tx.outbox.create({
        data: {
          eventType: 'PROJECT_STATUS_CHANGED',
          payload: { projectId, newStatus: dto.status, reason: dto.reason, adminId },
        },
      });

      return updated;
    });

    return {
      projectId,
      previousStatus: project.status,
      newStatus: result.status,
      updatedAt: result.updatedAt,
    };
  }

  async updateProject(projectId: string, dto: UpdateProjectAdminDto) {
    if (!dto || (dto.title === undefined && dto.description === undefined)) {
      throw new ValidationException('At least one field must be provided to update a project');
    }

    const project = await this.prismaRead.project.findUnique({ where: { id: projectId } });
    if (!project) throw new BusinessLogicException('Project not found', 'PROJECT_001');

    return this.prismaWrite.project.update({
      where: { id: projectId },
      data: dto,
    });
  }
}
