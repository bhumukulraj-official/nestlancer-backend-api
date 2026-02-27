import { Controller, Get, Post, Patch, Delete, Param, Body, Query, Req } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { Request } from 'express';
import { Public } from '@nestlancer/common';
import { HttpProxyService } from '../../proxy';

/**
 * Contact Gateway Controller
 * Routes contact requests to the Contact Service
 */
@Controller('contact')
@ApiTags('contact')
export class ContactController {
  constructor(private readonly proxy: HttpProxyService) {}

  @Post('inquiries')
  @Public()
  @ApiOperation({ summary: 'Submit contact inquiry' })
  async submitInquiry(@Req() req: Request) {
    return this.proxy.forward('contact', req);
  }

  @Get('inquiries')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'List contact inquiries' })
  async findAll(@Req() req: Request) {
    return this.proxy.forward('contact', req);
  }

  @Get('inquiries/:id')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get inquiry by ID' })
  async findOne(@Req() req: Request) {
    return this.proxy.forward('contact', req);
  }

  @Patch('inquiries/:id')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Update inquiry status' })
  async update(@Req() req: Request) {
    return this.proxy.forward('contact', req);
  }

  @Delete('inquiries/:id')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Delete inquiry' })
  async remove(@Req() req: Request) {
    return this.proxy.forward('contact', req);
  }

  @Post('inquiries/:id/respond')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Respond to inquiry' })
  async respond(@Req() req: Request) {
    return this.proxy.forward('contact', req);
  }

  @Get('health')
  @ApiOperation({ summary: 'Contact service health check' })
  async health(@Req() req: Request) {
    return this.proxy.forward('contact', req);
  }
}
