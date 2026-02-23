import { Controller, Get, Post, Put, Delete, Param, Body, Query } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { RequestsService } from './requests.service';

@Controller('requests')
@ApiTags('requests')
@ApiBearerAuth()
export class RequestsController {
  constructor(private readonly service: RequestsService) {}

  @Get()
  @ApiOperation({ summary: 'List requests' })
  findAll(@Query() query: Record<string, unknown>) { void query; return []; }

  @Get(':id')
  @ApiOperation({ summary: 'Get requests by ID' })
  findOne(@Param('id') id: string) { void id; return {}; }

  @Post()
  @ApiOperation({ summary: 'Create requests' })
  create(@Body() body: Record<string, unknown>) { void body; return {}; }

  @Put(':id')
  @ApiOperation({ summary: 'Update requests' })
  update(@Param('id') id: string, @Body() body: Record<string, unknown>) { void id; void body; return {}; }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete requests' })
  remove(@Param('id') id: string) { void id; return {}; }
}
