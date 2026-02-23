import { Controller, Get, Post, Put, Delete, Param, Body, Query } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { WebhooksService } from './webhooks.service';

@Controller('webhooks')
@ApiTags('webhooks')
@ApiBearerAuth()
export class WebhooksController {
  constructor(private readonly service: WebhooksService) {}

  @Get()
  @ApiOperation({ summary: 'List webhooks' })
  findAll(@Query() query: Record<string, unknown>) { void query; return []; }

  @Get(':id')
  @ApiOperation({ summary: 'Get webhooks by ID' })
  findOne(@Param('id') id: string) { void id; return {}; }

  @Post()
  @ApiOperation({ summary: 'Create webhooks' })
  create(@Body() body: Record<string, unknown>) { void body; return {}; }

  @Put(':id')
  @ApiOperation({ summary: 'Update webhooks' })
  update(@Param('id') id: string, @Body() body: Record<string, unknown>) { void id; void body; return {}; }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete webhooks' })
  remove(@Param('id') id: string) { void id; return {}; }
}
