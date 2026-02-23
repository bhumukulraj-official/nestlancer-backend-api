import { Injectable } from '@nestjs/common';
import { PrismaWriteService } from '@nestlancer/database/prisma/prisma-write.service';
import { PrismaReadService } from '@nestlancer/database/prisma/prisma-read.service';
import { BusinessLogicException } from '@nestlancer/common/exceptions/business-logic.exception';

@Injectable()
export class QuotesService {
    constructor(
        private readonly prismaWrite: PrismaWriteService,
        private readonly prismaRead: PrismaReadService,
    ) { }

    async getMyQuotes(userId: string) {
        const quotes = await this.prismaRead.quote.findMany({
            where: { userId, status: { notIn: ['DRAFT', 'PENDING'] } }, // Users only see sent quotes
            include: {
                request: { select: { title: true, category: true } }
            },
            orderBy: { createdAt: 'desc' }
        });

        return quotes.map(this.formatQuoteSummary);
    }

    async getQuoteDetails(userId: string, quoteId: string) {
        const quote = await this.prismaRead.quote.findFirst({
            where: { id: quoteId, userId, status: { notIn: ['DRAFT', 'PENDING'] } },
            include: {
                items: true,
                request: { select: { id: true, title: true, status: true, submittedAt: true } }
            }
        });

        if (!quote) {
            throw new BusinessLogicException('Quote not found', 'QUOTE_001');
        }

        if (quote.status === 'SENT') {
            await this.prismaWrite.quote.update({
                where: { id: quoteId },
                data: { status: 'VIEWED', viewedAt: new Date() }
            });
            // Need to re-fetch or just update the in-memory object for response
            quote.status = 'VIEWED';
            quote.viewedAt = new Date();
        }

        return this.formatQuoteDetailResponse(quote);
    }

    // Helpers
    private formatQuoteSummary(quote: any) {
        return {
            id: quote.id,
            requestId: quote.requestId,
            requestTitle: quote.request?.title,
            status: quote.status.toLowerCase().replace(/_([a-z])/g, (g) => g[1].toUpperCase()),
            totalAmount: quote.totalAmount,
            currency: quote.currency,
            validUntil: quote.validUntil,
            createdAt: quote.createdAt,
        };
    }

    private formatQuoteDetailResponse(quote: any) {
        return {
            id: quote.id,
            requestId: quote.requestId,
            status: quote.status.toLowerCase().replace(/_([a-z])/g, (g) => g[1].toUpperCase()),
            title: quote.request?.title || `Quote for Request ${quote.requestId}`,
            description: 'See items for details', // Maps to items normally
            totalAmount: quote.totalAmount,
            currency: quote.currency,
            validUntil: quote.validUntil,
            daysRemaining: Math.max(0, Math.ceil((new Date(quote.validUntil).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24))),
            paymentBreakdown: [], // In a real app, you'd map items to breakdown or have a separate breakdown table
            timeline: {}, // Placeholder
            scope: { included: [], excluded: [] }, // Placeholder
            technicalDetails: {}, // Placeholder
            terms: quote.termsAndConditions,
            attachments: [], // Placeholder
            request: quote.request,
            statusHistory: [], // Would fetch from a history table
            createdAt: quote.createdAt,
            updatedAt: quote.updatedAt,
            sentAt: quote.createdAt, // Approximated
            viewedAt: quote.viewedAt,
            acceptedAt: quote.acceptedAt,
            declinedAt: quote.declinedAt,
        };
    }
}
