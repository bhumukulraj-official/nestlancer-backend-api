import { Controller, Get, Post, Put, Delete, Param, Body, Query } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { NotificationsService } from './notifications.service';

@Controller('notifications')
@ApiTags('notifications')
@ApiBearerAuth()
export class NotificationsController {
  constructor(private readonly service: NotificationsService) {}

  @Get()
  @ApiOperation({ summary: 'List notifications' })
  findAll(@Query() query: Record<string, unknown>) { void query; return []; }

  @Get(':id')
  @ApiOperation({ summary: 'Get notifications by ID' })
  findOne(@Param('id') id: string) { void id; return {}; }

  @Post()
  @ApiOperation({ summary: 'Create notifications' })
  create(@Body() body: Record<string, unknown>) { void body; return {}; }

  @Put(':id')
  @ApiOperation({ summary: 'Update notifications' })
  update(@Param('id') id: string, @Body() body: Record<string, unknown>) { void id; void body; return {}; }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete notifications' })
  remove(@Param('id') id: string) { void id; return {}; }
}
