import { Controller, Get, Post, Patch, Delete, Param, Body, Query, Req } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { Request } from 'express';
import { HttpProxyService } from '../../proxy';

/**
 * Progress Gateway Controller
 * Routes progress requests to the Progress Service
 */
@Controller('progress')
@ApiTags('progress')
@ApiBearerAuth()
export class ProgressController {
    constructor(private readonly proxy: HttpProxyService) { }

    @Get()
    @ApiOperation({ summary: 'Get all progress entries' })
    async findAll(@Req() req: Request) {
        return this.proxy.forward('progress', req);
    }

    @Post()
    @ApiOperation({ summary: 'Create progress entry' })
    async create(@Req() req: Request) {
        return this.proxy.forward('progress', req);
    }

    @Get(':id')
    @ApiOperation({ summary: 'Get progress entry by ID' })
    async findOne(@Req() req: Request) {
        return this.proxy.forward('progress', req);
    }

    @Patch(':id')
    @ApiOperation({ summary: 'Update progress entry' })
    async update(@Req() req: Request) {
        return this.proxy.forward('progress', req);
    }

    @Delete(':id')
    @ApiOperation({ summary: 'Delete progress entry' })
    async remove(@Req() req: Request) {
        return this.proxy.forward('progress', req);
    }

    @Get('health')
    @ApiOperation({ summary: 'Progress service health check' })
    async health(@Req() req: Request) {
        return this.proxy.forward('progress', req);
    }
}
