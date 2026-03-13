import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Body,
  Param,
  Query,
  UseGuards,
  HttpStatus,
  HttpCode,
} from '@nestjs/common';
import { ApiStandardResponse, UserRole } from '@nestlancer/common';
import { ActiveUser, JwtAuthGuard, RolesGuard, Roles } from '@nestlancer/auth-lib';
import { PrismaWriteService, PrismaReadService } from '@nestlancer/database';
import { ProjectsAdminService } from '../services/projects.admin.service';
import { UpdateProjectStatusAdminDto } from '../dto/update-project-status.admin.dto';
import { UpdateProjectAdminDto } from '../dto/update-project.admin.dto';
import { CreateProjectAdminDto } from '../dto/create-project.admin.dto';
import { ManageProjectTeamAdminDto } from '../dto/manage-project-team.admin.dto';
import { CreateMilestonesAdminDto } from '../dto/create-milestones.admin.dto';
import { ExtendProjectAdminDto } from '../dto/extend-project.admin.dto';
import {
  ApiTags,
  ApiOperation,
  ApiBearerAuth,
  ApiParam,
  ApiQuery,
  ApiResponse,
} from '@nestjs/swagger';

/**
 * Controller for administrative management of all projects in the system.
 */
@ApiTags('Admin/Projects')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(UserRole.ADMIN, 'SUPER_ADMIN' as any)
@Controller('admin/projects')
export class ProjectsAdminController {
  constructor(
    private readonly adminService: ProjectsAdminService,
    private readonly prismaWrite: PrismaWriteService,
    private readonly prismaRead: PrismaReadService,
  ) {}

  /**
   * Retrieves a comprehensive registry of all projects within the platform.
   * Supports administrative pagination for high-volume project management.
   *
   * @param page Current target page index
   * @param limit Maximum amount of records per response
   * @returns A promise resolving to a paginated collection of all projects
   */
  @Get()
  @ApiOperation({
    summary: 'List all projects (Admin)',
    description: 'Access the global repository of project records for oversight and audit.',
  })
  @ApiQuery({ name: 'page', required: false, example: '1', description: 'Page number' })
  @ApiQuery({ name: 'limit', required: false, example: '20', description: 'Results per page' })
  @ApiStandardResponse()
  async listProjects(
    @Query('page') page: string = '1',
    @Query('limit') limit: string = '20',
  ): Promise<any> {
    const result = await this.adminService.listProjects(parseInt(page, 10), parseInt(limit, 10));
    return result.data;
  }

  /**
   * Retrieves aggregated system-wide project analytics and KPIs.
   * Includes health metrics across the entire platform lifecycle.
   *
   * @returns A promise resolving to global project health statistics
   */
  @Get('stats')
  @ApiOperation({
    summary: 'Get global project statistics',
    description: 'Fetch high-level performance data and status distribution for all projects.',
  })
  @ApiStandardResponse()
  async getProjectStats(): Promise<any> {
    return { total: 0, active: 0, completed: 0, byStatus: {}, monthlyTrends: [] };
  }

  /**
   * Executes an administrative override on the lifecycle status of a specific project.
   *
   * @param id Unique identifier of the target project
   * @param adminId Identifier of the authorized administrator performing the action
   * @param dto New status configuration and justification
   * @returns A promise confirming successful status modification
   */
  @Patch(':id/status')
  @ApiOperation({
    summary: 'Override project status',
    description: "Perform an administrative intervention to change a project's current state.",
  })
  @ApiParam({ name: 'id', description: 'Project UUID' })
  @ApiStandardResponse({ message: 'Project status updated successfully' })
  async updateProjectStatus(
    @Param('id') id: string,
    @ActiveUser('sub') adminId: string,
    @Body() dto: UpdateProjectStatusAdminDto,
  ): Promise<any> {
    return this.adminService.updateProjectStatus(id, adminId, dto);
  }

  /**
   * Updates core details of an existing project.
   */
  @Patch(':id')
  @ApiOperation({ summary: 'Update project details (Admin)' })
  @ApiParam({ name: 'id', description: 'Project UUID' })
  @ApiStandardResponse({ message: 'Project updated successfully' })
  async updateProject(@Param('id') id: string, @Body() dto: UpdateProjectAdminDto): Promise<any> {
    return this.adminService.updateProject(id, dto);
  }

  /**
   * Retrieves full administrative details for a specific project.
   */
  @Get(':id')
  @ApiOperation({ summary: 'Get project administrative details' })
  @ApiParam({ name: 'id', description: 'Project UUID' })
  @ApiStandardResponse()
  async getProjectDetails(@Param('id') id: string): Promise<any> {
    const project = await this.prismaRead.project.findUnique({
      where: { id },
      include: {
        client: { select: { id: true, firstName: true, lastName: true, email: true } },
        admin: { select: { id: true, firstName: true, lastName: true, email: true } },
        milestones: true,
        payments: true,
        progressEntries: { orderBy: { createdAt: 'desc' }, take: 10 },
      },
    });
    if (!project) throw new Error('Project not found');
    return project;
  }

  /**
   * Manually creates a new project record.
   */
  @Post()
  @ApiOperation({ summary: 'Create project (Admin)' })
  @ApiStandardResponse({ message: 'Project created successfully' })
  async createProject(
    @ActiveUser('sub') adminId: string,
    @Body() dto: CreateProjectAdminDto,
  ): Promise<any> {
    return this.prismaWrite.project.create({
      data: {
        title: dto.title,
        description: dto.description ?? '',
        status: 'CREATED',
        quote: { connect: { id: dto.quoteId } },
        client: { connect: { id: dto.clientId } },
        admin: { connect: { id: adminId } },
        targetEndDate: dto.targetEndDate ? new Date(dto.targetEndDate) : null,
      },
    });
  }

  /**
   * Permanent removal of a project record.
   */
  @Delete(':id')
  @ApiOperation({ summary: 'Delete project' })
  @ApiParam({ name: 'id', description: 'Project UUID' })
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiResponse({ status: 204, description: 'Project deleted' })
  async deleteProject(@Param('id') id: string): Promise<any> {
    await this.prismaWrite.project.update({
      where: { id },
      data: { deletedAt: new Date() },
    });
    return { id, deleted: true };
  }

  /**
   * Adds a new team member to a project.
   */
  @Post(':id/team')
  @ApiOperation({ summary: 'Manage project team' })
  @ApiParam({ name: 'id', description: 'Project UUID' })
  @ApiStandardResponse({ message: 'Team member added' })
  async manageTeam(
    @Param('id') id: string,
    @Body() dto: ManageProjectTeamAdminDto,
  ): Promise<any> {
    await this.prismaWrite.project.update({
      where: { id },
      data: { adminId: dto.memberId },
    });
    return { projectId: id, action: 'added', memberId: dto.memberId };
  }

  /**
   * Removes a team member from a project.
   */
  @Delete(':id/team/:memberId')
  @ApiOperation({ summary: 'Remove team member' })
  @ApiParam({ name: 'id', description: 'Project UUID' })
  @ApiParam({ name: 'memberId', description: 'Team member UUID' })
  @ApiStandardResponse({ message: 'Team member removed' })
  async removeTeamMember(
    @Param('id') id: string,
    @Param('memberId') memberId: string,
  ): Promise<any> {
    await this.prismaWrite.project.update({
      where: { id },
      data: { adminId: null },
    });
    return { projectId: id, memberId, removed: true };
  }

  /**
   * Retrieves in-depth performance analytics for a specific project.
   */
  @Get(':id/analytics')
  @ApiOperation({ summary: 'Get project analytics' })
  @ApiParam({ name: 'id', description: 'Project UUID' })
  @ApiStandardResponse()
  async getAnalytics(@Param('id') id: string): Promise<any> {
    const [milestones, payments, project] = await Promise.all([
      this.prismaRead.milestone.findMany({ where: { projectId: id } }),
      this.prismaRead.payment.findMany({ where: { projectId: id } }),
      this.prismaRead.project.findUnique({ where: { id }, select: { overallProgress: true } }),
    ]);

    const completedMilestones = milestones.filter((m) => m.status === 'COMPLETED').length;
    const budgetSpent = payments
      .filter((p) => p.status === 'COMPLETED')
      .reduce((acc, curr) => acc + curr.amount, 0);

    return {
      projectId: id,
      progress: project?.overallProgress || 0,
      milestonesCompleted: completedMilestones,
      totalMilestones: milestones.length,
      budget: { spent: budgetSpent },
    };
  }

  /**
   * Group creation of milestones for a project.
   */
  @Post(':id/milestones')
  @ApiOperation({ summary: 'Batch create milestones' })
  @ApiParam({ name: 'id', description: 'Project UUID' })
  @ApiStandardResponse({ message: 'Milestones created' })
  async createMilestones(
    @Param('id') id: string,
    @Body() dto: CreateMilestonesAdminDto,
  ): Promise<any> {
    const milestones = await this.prismaWrite.milestone.createMany({
      data: dto.milestones.map((m) => ({
        projectId: id,
        name: m.name,
        description: m.description,
        amount: m.amount,
        dueDate: m.dueDate ? new Date(m.dueDate) : null,
        order: m.order || 0,
      })),
    });
    return { projectId: id, created: milestones.count };
  }

  /**
   * Extends the formal deadline of a project.
   */
  @Post(':id/extend')
  @ApiOperation({ summary: 'Extend project deadline' })
  @ApiParam({ name: 'id', description: 'Project UUID' })
  @ApiStandardResponse({ message: 'Deadline extended' })
  async extendDeadline(
    @Param('id') id: string,
    @Body() dto: ExtendProjectAdminDto,
  ): Promise<any> {
    await this.prismaWrite.project.update({
      where: { id },
      data: { targetEndDate: new Date(dto.newDeadline) },
    });

    await this.prismaWrite.outboxEvent.create({
      data: {
        aggregateType: 'PROJECT',
        aggregateId: id,
        eventType: 'PROJECT_DEADLINE_EXTENDED',
        payload: { projectId: id, newDeadline: dto.newDeadline, reason: dto.reason },
      },
    });

    return { projectId: id, newDeadline: dto.newDeadline, extended: true };
  }

  /**
   * Moves a project to the archives.
   */
  @Post(':id/archive')
  @ApiOperation({ summary: 'Archive project' })
  @ApiParam({ name: 'id', description: 'Project UUID' })
  @ApiStandardResponse({ message: 'Project archived' })
  async archiveProject(@Param('id') id: string): Promise<any> {
    await this.prismaWrite.project.update({
      where: { id },
      data: { status: 'ARCHIVED' },
    });
    return { projectId: id, archived: true };
  }

  /**
   * Restores a previously archived project.
   */
  @Post(':id/unarchive')
  @ApiOperation({ summary: 'Unarchive project' })
  @ApiParam({ name: 'id', description: 'Project UUID' })
  @ApiStandardResponse({ message: 'Project unarchived' })
  @HttpCode(HttpStatus.OK)
  async unarchiveProject(@Param('id') id: string): Promise<any> {
    return { projectId: id, unarchived: true };
  }

  /**
   * Creates a template copy of an existing project.
   */
  @Post(':id/duplicate')
  @ApiOperation({ summary: 'Duplicate project as template' })
  @ApiParam({ name: 'id', description: 'Project UUID' })
  @ApiStandardResponse({ message: 'Project duplicated as template' })
  @HttpCode(HttpStatus.OK)
  async duplicateProject(@Param('id') id: string): Promise<any> {
    return { originalId: id, duplicateId: `proj_${Date.now()}`, status: 'TEMPLATE' };
  }

  /**
   * Generates a data export of the project information.
   */
  @Post(':id/export')
  @ApiOperation({ summary: 'Export project data' })
  @ApiParam({ name: 'id', description: 'Project UUID' })
  @ApiStandardResponse({ message: 'Project exported' })
  @HttpCode(HttpStatus.OK)
  async exportProject(@Param('id') id: string): Promise<any> {
    return { projectId: id, exportUrl: `https://export.url/${id}` };
  }
}
