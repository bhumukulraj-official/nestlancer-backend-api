import { Controller, Get, Param } from '@nestjs/common';
import { ApiStandardResponse } from '@nestlancer/common/decorators/api-standard-response.decorator';
import { Public } from '@nestlancer/common/decorators/public.decorator';
import { PrismaReadService } from '@nestlancer/database/prisma/prisma-read.service';
import { BusinessLogicException } from '@nestlancer/common/exceptions/business-logic.exception';

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
