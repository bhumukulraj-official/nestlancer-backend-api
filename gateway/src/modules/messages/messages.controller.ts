import { Controller, Get, Post, Put, Delete, Param, Body, Query } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { MessagesService } from './messages.service';

@Controller('messages')
@ApiTags('messages')
@ApiBearerAuth()
export class MessagesController {
  constructor(private readonly service: MessagesService) {}

  @Get()
  @ApiOperation({ summary: 'List messages' })
  findAll(@Query() query: Record<string, unknown>) { void query; return []; }

  @Get(':id')
  @ApiOperation({ summary: 'Get messages by ID' })
  findOne(@Param('id') id: string) { void id; return {}; }

  @Post()
  @ApiOperation({ summary: 'Create messages' })
  create(@Body() body: Record<string, unknown>) { void body; return {}; }

  @Put(':id')
  @ApiOperation({ summary: 'Update messages' })
  update(@Param('id') id: string, @Body() body: Record<string, unknown>) { void id; void body; return {}; }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete messages' })
  remove(@Param('id') id: string) { void id; return {}; }
}
