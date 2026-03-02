import { Controller, Get, Param } from '@nestjs/common';
import { ApiStandardResponse, Public, BusinessLogicException } from '@nestlancer/common';
import { PrismaReadService } from '@nestlancer/database';

@Controller('public')
export class ProjectsPublicController {
    constructor(private readonly prismaRead: PrismaReadService) { }

    @Public()
    @Get()
    @ApiStandardResponse()
    async listPublicProjects() {
        // Fetch portfolio projects
        return { data: [], pagination: { total: 0 } };
    }

    @Public()
    @Get(':id')
    @ApiStandardResponse()
    async getPublicProjectDetails(@Param('id') id: string) {
        // Fetch fully public project
        throw new BusinessLogicException('Project not public or not found', 'PROJECT_001');
    }
}
