import { Injectable } from '@nestjs/common';
import { PrismaWriteService } from '@nestlancer/database/prisma/prisma-write.service';
import { PrismaReadService } from '@nestlancer/database/prisma/prisma-read.service';
import { BusinessLogicException } from '@nestlancer/common/exceptions/business-logic.exception';
import { CreateQuoteAdminDto } from '../dto/create-quote.admin.dto';

@Injectable()
export class QuotesAdminService {
    constructor(
        private readonly prismaWrite: PrismaWriteService,
        private readonly prismaRead: PrismaReadService,
    ) { }

    async listQuotes(page: number, limit: number) {
        const [quotes, total] = await Promise.all([
            this.prismaRead.quote.findMany({
                skip: (page - 1) * limit,
                take: limit,
                orderBy: { createdAt: 'desc' },
                include: { user: { select: { firstName: true, email: true } } }
            }),
            this.prismaRead.quote.count()
        ]);

        return {
            data: quotes.map(q => ({
                id: q.id,
                status: q.status.toLowerCase().replace(/_([a-z])/g, (g) => g[1].toUpperCase()),
                totalAmount: q.totalAmount,
                currency: q.currency,
                client: q.user,
                createdAt: q.createdAt
            })),
            pagination: { page, limit, total, totalPages: Math.ceil(total / limit) }
        };
    }

    // Example admin creation (bypassing normal flow if needed, but normally handled in RequestsService)
    async createQuote(adminId: string, dto: CreateQuoteAdminDto) {
        // Basic validation implementation
        const request = await this.prismaRead.projectRequest.findUnique({ where: { id: dto.requestId } });
        if (!request) throw new BusinessLogicException('Request not found', 'QUOTE_007');

        const totalBreakdown = dto.paymentBreakdown.reduce((sum, item) => sum + item.amount, 0);
        if (totalBreakdown !== dto.totalAmount) {
            throw new BusinessLogicException('Payment breakdown does not match total amount', 'QUOTE_009');
        }

        const quote = await this.prismaWrite.quote.create({
            data: {
                requestId: dto.requestId,
                userId: request.userId,
                createdById: adminId,
                status: 'DRAFT',
                subtotal: dto.totalAmount, // Assuming no tax in this DTO for simplicity
                taxPercentage: 0,
                taxAmount: 0,
                totalAmount: dto.totalAmount,
                currency: dto.currency,
                validUntil: new Date(dto.validUntil),
                termsAndConditions: dto.terms,
                internalNotes: dto.notes,
                paymentBreakdown: dto.paymentBreakdown as any,
            }
        });

        return {
            id: quote.id,
            status: 'draft',
            totalAmount: quote.totalAmount,
            currency: quote.currency
        };
    }

    async sendQuote(quoteId: string) {
        const quote = await this.prismaRead.quote.findUnique({ where: { id: quoteId } });
        if (!quote) throw new BusinessLogicException('Quote not found', 'QUOTE_001');

        await this.prismaWrite.$transaction(async (tx) => {
            await tx.quote.update({
                where: { id: quoteId },
                data: { status: 'SENT' }
            });
            await tx.outbox.create({
                data: { eventType: 'QUOTE_SENT', payload: { quoteId, userId: quote.userId } }
            });
        });

        return true;
    }
}
