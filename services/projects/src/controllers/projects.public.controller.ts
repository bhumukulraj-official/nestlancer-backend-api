import { Controller, Get, Param } from '@nestjs/common';
import { ApiStandardResponse, Public, BusinessLogicException } from '@nestlancer/common';
import { PrismaReadService } from '@nestlancer/database';
import { ApiTags, ApiOperation, ApiParam } from '@nestjs/swagger';

/**
 * Controller for public-facing project information and discovery.
 */
@ApiTags('Public/Projects')
@Controller('public')
export class ProjectsPublicController {
    constructor(private readonly prismaRead: PrismaReadService) { }

    /**
     * Lists publicly available projects for discovery.
     */
    @Public()
    @Get()
    @ApiOperation({ summary: 'List public projects' })
    @ApiStandardResponse()
    async listPublicProjects(): Promise<any> {
        // Fetch portfolio projects
        return { data: [], pagination: { total: 0 } };
    }

    /**
     * Retrieves detailed information for a specific public project.
     */
    @Public()
    @Get(':id')
    @ApiOperation({ summary: 'Get public project details' })
    @ApiParam({ name: 'id', description: 'Project UUID' })
    @ApiStandardResponse()
    async getPublicProjectDetails(@Param('id') id: string): Promise<any> {
        // Fetch fully public project
        throw new BusinessLogicException('Project not public or not found', 'PROJECT_001');
    }
}

