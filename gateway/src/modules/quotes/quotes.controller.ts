import { Controller, Get, Post, Patch, Delete, Param, Body, Query, Req } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { Request } from 'express';
import { HttpProxyService } from '../../proxy';

/**
 * Quotes Gateway Controller
 * Routes quote requests to the Quotes Service
 */
@Controller('quotes')
@ApiTags('quotes')
@ApiBearerAuth()
export class QuotesController {
  constructor(private readonly proxy: HttpProxyService) {}

  @Get()
  @ApiOperation({ summary: 'List quotes' })
  async findAll(@Req() req: Request) {
    return this.proxy.forward('quotes', req);
  }

  @Post()
  @ApiOperation({ summary: 'Create quote' })
  async create(@Req() req: Request) {
    return this.proxy.forward('quotes', req);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get quote by ID' })
  async findOne(@Req() req: Request) {
    return this.proxy.forward('quotes', req);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update quote' })
  async update(@Req() req: Request) {
    return this.proxy.forward('quotes', req);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete quote' })
  async remove(@Req() req: Request) {
    return this.proxy.forward('quotes', req);
  }

  @Post(':id/accept')
  @ApiOperation({ summary: 'Accept quote' })
  async accept(@Req() req: Request) {
    return this.proxy.forward('quotes', req);
  }

  @Post(':id/reject')
  @ApiOperation({ summary: 'Reject quote' })
  async reject(@Req() req: Request) {
    return this.proxy.forward('quotes', req);
  }

  @Post(':id/negotiate')
  @ApiOperation({ summary: 'Negotiate quote' })
  async negotiate(@Req() req: Request) {
    return this.proxy.forward('quotes', req);
  }

  @Get(':id/pdf')
  @ApiOperation({ summary: 'Download quote PDF' })
  async downloadPdf(@Req() req: Request) {
    return this.proxy.forward('quotes', req);
  }

  @Get('health')
  @ApiOperation({ summary: 'Quotes service health check' })
  async health(@Req() req: Request) {
    return this.proxy.forward('quotes', req);
  }
}
