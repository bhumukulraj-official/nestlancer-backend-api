import { Controller, Get, Post, Patch, Delete, Param, Query, Body } from '@nestjs/common';
import { Roles, UserRole, ParseUuidPipe, Idempotent, CurrentUser } from '@nestlancer/common';
import { QueryContactsDto } from '../../dto/query-contacts.dto';
import { UpdateContactStatusDto } from '../../dto/update-contact-status.dto';
import { RespondContactDto } from '../../dto/respond-contact.dto';
import { ContactService } from '../../services/contact.service';
import { ContactResponseService } from '../../services/contact-response.service';
import { ContactAdminService } from '../../services/contact-admin.service';

@Controller('admin/contact')
export class ContactAdminController {
    constructor(
        private readonly contactService: ContactService,
        private readonly responseService: ContactResponseService,
        private readonly adminService: ContactAdminService,
    ) { }

    @Roles(UserRole.ADMIN)
    @Get()
    async getContacts(@Query() query: QueryContactsDto) {
        const { items, totalItems } = await this.contactService.findAll(query);
        const summary = await this.adminService.getStatistics();

        return {
            data: items,
            summary,
            pagination: {
                page: query.page,
                limit: query.limit,
                total: totalItems,
                totalPages: Math.ceil(totalItems / query.limit),
                hasNext: (query.page * query.limit) < totalItems,
                hasPrev: query.page > 1,
            },
        };
    }

    @Roles(UserRole.ADMIN)
    @Get(':id')
    async getContactDetails(@Param('id', ParseUuidPipe) id: string) {
        return this.contactService.findById(id);
    }

    @Roles(UserRole.ADMIN)
    @Patch(':id/status')
    async updateStatus(
        @Param('id', ParseUuidPipe) id: string,
        @Body() dto: UpdateContactStatusDto,
    ) {
        return this.contactService.updateStatus(id, dto.status);
    }

    @Roles(UserRole.ADMIN)
    @Post(':id/respond')
    async respondToContact(
        @Param('id', ParseUuidPipe) id: string,
        @Body() dto: RespondContactDto,
        @CurrentUser() admin: any,
    ) {
        const result = await this.responseService.respond(id, admin.userId, dto);
        return {
            message: 'Response sent successfully',
            data: result,
        };
    }

    @Roles(UserRole.ADMIN)
    @Idempotent()
    @Post(':id/spam')
    async markAsSpam(@Param('id', ParseUuidPipe) id: string) {
        return this.adminService.markAsSpam(id);
    }

    @Roles(UserRole.ADMIN)
    @Idempotent()
    @Delete(':id')
    async deleteContact(@Param('id', ParseUuidPipe) id: string) {
        await this.contactService.softDelete(id);
        return { message: 'Contact deleted successfully' };
    }
}
