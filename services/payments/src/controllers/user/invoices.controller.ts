import { Controller, Get, Param, Query, Injectable } from '@nestjs/common';
import { Auth, CurrentUser } from '@nestlancer/auth-lib';
import { PrismaReadService } from '@nestlancer/database';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiResponse } from '@nestjs/swagger';

/**
 * Controller for managing user invoices.
 * Invoices are generated from completed payments that have invoice numbers.
 */
@ApiTags('Invoices')
@ApiBearerAuth()
@Auth()
@Controller('invoices')
export class InvoicesController {
    constructor(
        private readonly prismaRead: PrismaReadService,
    ) { }

    /**
     * Retrieves a paginated registry of all digital invoices issued to the authenticated user.
     *
     * @param userId Unique identifier of the authenticated user
     * @param page Target page index for pagination
     * @param limit Maximum record limit per page
     * @returns A promise resolving to a paginated set of user invoices
     */
    @Get()
    @ApiOperation({ summary: 'List user invoices', description: 'Access your global repository of financial invoices for billing and tax purposes.' })
    @ApiResponse({ status: 200, description: 'Invoices list retrieved successfully' })
    async listInvoices(
        @CurrentUser('userId') userId: string,
        @Query('page') page: string = '1',
        @Query('limit') limit: string = '20',
    ): Promise<any> {
        const pageNum = parseInt(page, 10);
        const limitNum = parseInt(limit, 10);
        const skip = (pageNum - 1) * limitNum;

        const where: any = {
            clientId: userId,
            invoiceNumber: { not: null },
        };

        const [items, total] = await Promise.all([
            this.prismaRead.payment.findMany({
                where,
                skip,
                take: limitNum,
                orderBy: { createdAt: 'desc' },
                select: {
                    id: true,
                    invoiceNumber: true,
                    amount: true,
                    currency: true,
                    status: true,
                    customNotes: true,
                    createdAt: true,
                },
            }),
            this.prismaRead.payment.count({ where }),
        ]);

        return {
            status: 'success',
            data: items.map(p => ({
                id: p.id,
                invoiceNumber: p.invoiceNumber,
                amount: p.amount,
                currency: p.currency,
                status: p.status,
                customNotes: p.customNotes,
                issuedAt: p.createdAt,
            })),
            pagination: {
                page: pageNum,
                limit: limitNum,
                total,
                totalPages: Math.ceil(total / limitNum),
            },
        };
    }

    /**
     * Retrieves full details for a specific invoice.
     */
    @Get(':id')
    @ApiOperation({ summary: 'Get invoice details' })
    @ApiResponse({ status: 200, description: 'Invoice details retrieved successfully' })
    async getInvoice(
        @CurrentUser('userId') userId: string,
        @Param('id') id: string,
    ): Promise<any> {
        const payment = await this.prismaRead.payment.findFirst({
            where: { id, clientId: userId, invoiceNumber: { not: null } },
            include: {
                project: { select: { id: true, title: true } },
            },
        });

        if (!payment) {
            return { status: 'error', message: 'Invoice not found' };
        }

        return {
            status: 'success',
            data: {
                id: payment.id,
                invoiceNumber: payment.invoiceNumber,
                userId: payment.clientId,
                projectId: payment.projectId,
                project: (payment as any).project,
                amount: payment.amount,
                currency: payment.currency,
                status: payment.status,
                customNotes: payment.customNotes,
                invoiceUrl: payment.invoiceUrl,
                issuedAt: payment.createdAt,
            },
        };
    }

    /**
     * Generates and returns a download link for an invoice PDF.
     */
    @Get(':id/download')
    @ApiOperation({ summary: 'Download invoice PDF' })
    @ApiResponse({ status: 200, description: 'Invoice download URL generated' })
    async downloadInvoice(
        @CurrentUser('userId') userId: string,
        @Param('id') id: string,
    ): Promise<any> {
        const payment = await this.prismaRead.payment.findFirst({
            where: { id, clientId: userId, invoiceNumber: { not: null } },
            select: { invoiceUrl: true },
        });

        if (!payment) {
            return { status: 'error', message: 'Invoice not found' };
        }

        return {
            status: 'success',
            data: {
                downloadUrl: payment.invoiceUrl || null,
                expiresAt: payment.invoiceUrl
                    ? new Date(Date.now() + 3600000).toISOString()
                    : null,
            },
        };
    }
}
