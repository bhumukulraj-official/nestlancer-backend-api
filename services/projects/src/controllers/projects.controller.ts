import { Controller, Get, Post, Body, Param, UseGuards, Res } from '@nestjs/common';
import { ApiStandardResponse, Public } from '@nestlancer/common';
import { ActiveUser, JwtAuthGuard } from '@nestlancer/auth-lib';
import { ProjectsService } from '../services/projects.service';
import { ProjectTimelineService } from '../services/project-timeline.service';
import { ProjectDeliverablesService } from '../services/project-deliverables.service';
import { ProjectPaymentsService } from '../services/project-payments.service';
import { ApproveProjectDto } from '../dto/approve-project.dto';
import { RequestProjectRevisionDto } from '../dto/request-project-revision.dto';

@Controller()
@UseGuards(JwtAuthGuard)
export class ProjectsController {
    constructor(
        private readonly projectsService: ProjectsService,
        private readonly timelineService: ProjectTimelineService,
        private readonly deliverablesService: ProjectDeliverablesService,
        private readonly paymentsService: ProjectPaymentsService,
    ) { }

    @Public()
    @Get('health')
    @ApiStandardResponse()
    healthCheck() {
        return { status: 'ok', service: 'projects' };
    }

    @Get('stats')
    @ApiStandardResponse()
    getStats(@ActiveUser('sub') userId: string) {
        return this.projectsService.getUserStats(userId);
    }

    @Get('templates')
    @ApiStandardResponse()
    getTemplates() {
        return { templates: [] };
    }

    @Post('templates')
    @ApiStandardResponse({ message: 'Template created' })
    createTemplate(@ActiveUser('sub') userId: string, @Body() body: any) {
        return { id: `tpl_${Date.now()}`, ...body };
    }

    @Get()
    @ApiStandardResponse()
    listProjects(@ActiveUser('sub') userId: string) {
        return this.projectsService.getMyProjects(userId);
    }

    @Get(':id')
    @ApiStandardResponse()
    getProjectDetails(@ActiveUser('sub') userId: string, @Param('id') id: string) {
        return this.projectsService.getProjectDetails(userId, id);
    }

    @Get(':id/timeline')
    @ApiStandardResponse()
    getTimeline(@ActiveUser('sub') userId: string, @Param('id') id: string) {
        return this.timelineService.getTimeline(userId, id);
    }

    @Get(':id/deliverables')
    @ApiStandardResponse()
    getDeliverables(@ActiveUser('sub') userId: string, @Param('id') id: string) {
        return this.deliverablesService.getDeliverables(userId, id);
    }

    @Get(':id/payments')
    @ApiStandardResponse()
    getPayments(@ActiveUser('sub') userId: string, @Param('id') id: string) {
        return this.paymentsService.getPayments(userId, id);
    }

    @Post(':id/approve')
    @ApiStandardResponse({ message: 'Project approved successfully. Thank you for your feedback!' })
    approveProject(@ActiveUser('sub') userId: string, @Param('id') id: string, @Body() dto: ApproveProjectDto) {
        return this.projectsService.approveProject(userId, id, dto);
    }

    @Post(':id/request-revision')
    @ApiStandardResponse({ message: 'Revision request submitted successfully' })
    requestRevision(@ActiveUser('sub') userId: string, @Param('id') id: string, @Body() dto: RequestProjectRevisionDto) {
        return this.projectsService.requestRevision(userId, id, dto);
    }

    @Get(':id/progress')
    @ApiStandardResponse()
    getProgress(@ActiveUser('sub') userId: string, @Param('id') id: string) {
        // TODO: Get project progress summary
        return { projectId: id, overallProgress: 0, milestones: [], recentUpdates: [] };
    }

    @Get(':id/milestones')
    @ApiStandardResponse()
    getMilestones(@ActiveUser('sub') userId: string, @Param('id') id: string) {
        // TODO: Get project milestones
        return { projectId: id, milestones: [] };
    }

    @Get(':id/messages')
    @ApiStandardResponse()
    getMessages(@ActiveUser('sub') userId: string, @Param('id') id: string) {
        // TODO: Get project-related messages
        return { projectId: id, messages: [], pagination: { page: 1, limit: 20, total: 0, totalPages: 0 } };
    }

    @Post(':id/messages')
    @ApiStandardResponse({ message: 'Message sent successfully' })
    sendMessage(@ActiveUser('sub') userId: string, @Param('id') id: string, @Body() body: any) {
        return { projectId: id, messageId: `msg_${Date.now()}`, sent: true };
    }

    @Post(':id/feedback')
    @ApiStandardResponse({ message: 'Feedback submitted successfully' })
    submitFeedback(@ActiveUser('sub') userId: string, @Param('id') id: string, @Body() body: any) {
        // TODO: Submit project feedback
        return { projectId: id, feedbackId: `fb_${Date.now()}`, submitted: true };
    }

    @Get(':id/feedback')
    @ApiStandardResponse()
    getFeedback(@ActiveUser('sub') userId: string, @Param('id') id: string) {
        // TODO: Get project feedback
        return { projectId: id, feedback: [] };
    }
}
