import { Controller, Get, Post, Patch, Delete, Body, Param, Query, UseGuards, HttpStatus, Res } from '@nestjs/common';
import { ApiStandardResponse, UserRole } from '@nestlancer/common';
import { ActiveUser, JwtAuthGuard, RolesGuard, Roles } from '@nestlancer/auth-lib';
import { ProjectsAdminService } from '../services/projects.admin.service';
import { UpdateProjectStatusAdminDto } from '../dto/update-project-status.admin.dto';
import { UpdateProjectAdminDto } from '../dto/update-project.admin.dto';

@Controller('admin/projects')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(UserRole.ADMIN, 'SUPER_ADMIN' as any)
export class ProjectsAdminController {
    constructor(
        private readonly adminService: ProjectsAdminService,
    ) { }

    @Get()
    @ApiStandardResponse()
    listProjects(
        @Query('page') page: string = '1',
        @Query('limit') limit: string = '20'
    ) {
        return this.adminService.listProjects(parseInt(page, 10), parseInt(limit, 10));
    }

    @Get('stats')
    @ApiStandardResponse()
    getProjectStats() {
        return { total: 0, active: 0, completed: 0, byStatus: {}, monthlyTrends: [] };
    }

    @Patch(':id/status')
    @ApiStandardResponse({ message: 'Project status updated successfully' })
    updateProjectStatus(
        @Param('id') id: string,
        @ActiveUser('sub') adminId: string,
        @Body() dto: UpdateProjectStatusAdminDto
    ) {
        return this.adminService.updateProjectStatus(id, adminId, dto);
    }

    @Patch(':id')
    @ApiStandardResponse({ message: 'Project updated successfully' })
    updateProject(@Param('id') id: string, @Body() dto: UpdateProjectAdminDto) {
        return this.adminService.updateProject(id, dto);
    }

    @Get(':id')
    @ApiStandardResponse()
    getProjectDetails(@Param('id') id: string) {
        // TODO: Admin-level project details
        return { id, message: 'Project details placeholder' };
    }

    @Post()
    @ApiStandardResponse({ message: 'Project created successfully' })
    createProject(@ActiveUser('sub') adminId: string, @Body() body: any) {
        // TODO: Admin create project
        return { id: `proj_${Date.now()}`, createdBy: adminId, ...body };
    }

    @Delete(':id')
    @ApiStandardResponse({ message: 'Project deleted successfully' })
    deleteProject(@Param('id') id: string) {
        // TODO: Admin delete project
        return { id, deleted: true };
    }

    @Post(':id/team')
    @ApiStandardResponse({ message: 'Team member added' })
    manageTeam(@Param('id') id: string, @Body() body: any) {
        // TODO: Add team member
        return { projectId: id, action: 'added', ...body };
    }

    @Delete(':id/team/:memberId')
    @ApiStandardResponse({ message: 'Team member removed' })
    removeTeamMember(@Param('id') id: string, @Param('memberId') memberId: string) {
        // TODO: Remove team member
        return { projectId: id, memberId, removed: true };
    }

    @Get(':id/analytics')
    @ApiStandardResponse()
    getAnalytics(@Param('id') id: string) {
        // TODO: Project analytics
        return { projectId: id, progress: 0, milestonesCompleted: 0, timeSpent: 0, budget: { spent: 0, remaining: 0 } };
    }

    @Post(':id/milestones')
    @ApiStandardResponse({ message: 'Milestones created' })
    createMilestones(@Param('id') id: string, @Body() body: any) {
        // TODO: Create milestones for project
        return { projectId: id, milestones: [] };
    }

    @Post(':id/extend')
    @ApiStandardResponse({ message: 'Deadline extended' })
    extendDeadline(@Param('id') id: string, @Body() body: { newDeadline: string; reason: string }) {
        // TODO: Extend project deadline
        return { projectId: id, newDeadline: body.newDeadline, extended: true };
    }

    @Post(':id/archive')
    @ApiStandardResponse({ message: 'Project archived' })
    archiveProject(@Param('id') id: string) {
        // TODO: Archive project
        return { projectId: id, archived: true };
    }

    @Post(':id/unarchive')
    @ApiStandardResponse({ message: 'Project unarchived' })
    unarchiveProject(@Param('id') id: string) {
        return { projectId: id, unarchived: true };
    }

    @Post(':id/duplicate')
    @ApiStandardResponse({ message: 'Project duplicated as template' })
    duplicateProject(@Param('id') id: string) {
        return { originalId: id, duplicateId: `proj_${Date.now()}`, status: 'TEMPLATE' };
    }

    @Post(':id/export')
    @ApiStandardResponse({ message: 'Project exported' })
    exportProject(@Param('id') id: string) {
        return { projectId: id, exportUrl: `https://export.url/${id}` };
    }
}
