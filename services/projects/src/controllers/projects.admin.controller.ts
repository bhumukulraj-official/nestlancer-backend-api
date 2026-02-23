import { Controller, Get, Post, Patch, Delete, Body, Param, Query, UseGuards, HttpStatus, Res } from '@nestjs/common';
import { ApiStandardResponse } from '@nestlancer/common/decorators/api-standard-response.decorator';
import { ActiveUser } from '@nestlancer/auth-lib/decorators/active-user.decorator';
import { JwtAuthGuard } from '@nestlancer/auth-lib/guards/jwt-auth.guard';
import { RolesGuard } from '@nestlancer/auth-lib/guards/roles.guard';
import { Roles } from '@nestlancer/auth-lib/decorators/roles.decorator';
import { UserRole } from '@nestlancer/common/enums/role.enum';
import { ProjectsAdminService } from '../services/projects.admin.service';
import { UpdateProjectStatusAdminDto } from '../dto/update-project-status.admin.dto';
import { UpdateProjectAdminDto } from '../dto/update-project.admin.dto';

@Controller('admin/projects')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(UserRole.ADMIN, UserRole.SUPER_ADMIN)
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
}
