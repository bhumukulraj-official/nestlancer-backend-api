import { Controller, Get, Post, Put, Delete, Param, Body, Query } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { PortfolioService } from './portfolio.service';

@Controller('portfolio')
@ApiTags('portfolio')
@ApiBearerAuth()
export class PortfolioController {
  constructor(private readonly service: PortfolioService) {}

  @Get()
  @ApiOperation({ summary: 'List portfolio' })
  findAll(@Query() query: Record<string, unknown>) { void query; return []; }

  @Get(':id')
  @ApiOperation({ summary: 'Get portfolio by ID' })
  findOne(@Param('id') id: string) { void id; return {}; }

  @Post()
  @ApiOperation({ summary: 'Create portfolio' })
  create(@Body() body: Record<string, unknown>) { void body; return {}; }

  @Put(':id')
  @ApiOperation({ summary: 'Update portfolio' })
  update(@Param('id') id: string, @Body() body: Record<string, unknown>) { void id; void body; return {}; }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete portfolio' })
  remove(@Param('id') id: string) { void id; return {}; }
}
