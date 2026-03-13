import { Injectable } from '@nestjs/common';
import { PrismaWriteService, PrismaReadService } from '@nestlancer/database';
import { BusinessLogicException } from '@nestlancer/common';
import { CreateQuoteDto } from '../dto/create-quote.dto';

@Injectable()
export class QuotesAdminService {
  constructor(
    private readonly prismaWrite: PrismaWriteService,
    private readonly prismaRead: PrismaReadService,
  ) {}

  async createQuote(requestId: string, adminId: string, dto: CreateQuoteDto) {
    const request = await this.prismaRead.projectRequest.findFirst({
      where: { id: requestId, deletedAt: null },
    });

    if (!request) throw new BusinessLogicException('Request not found', 'REQUEST_001');

    if (request.status === 'QUOTED') {
      throw new BusinessLogicException('Request already has active quote', 'REQUEST_006');
    }

    const subtotal = dto.items.reduce((sum, item) => sum + item.quantity * item.unitPrice, 0);
    const taxAmount = subtotal * (dto.taxPercentage / 100);
    const totalAmount = subtotal + taxAmount;

    const quote = await this.prismaWrite.$transaction(async (tx: any) => {
      const newQuote = await tx.quote.create({
        data: {
          requestId,
          userId: request.userId,
          createdById: adminId,
          title: request.title,
          description: request.description,
          subtotal,
          taxPercentage: dto.taxPercentage,
          taxAmount,
          totalAmount,
          currency: dto.currency,
          validUntil: new Date(dto.validUntil),
          termsAndConditions: dto.termsAndConditions,
          internalNotes: dto.internalNotes,
          status: 'PENDING',
          paymentBreakdown: dto.items.map((i) => ({
            description: i.description,
            quantity: i.quantity,
            unitPrice: i.unitPrice,
            totalPrice: i.quantity * i.unitPrice,
          })) as any,
        },
      });

      await tx.projectRequest.update({
        where: { id: requestId },
        data: { status: 'QUOTED' },
      });

      await tx.requestStatusHistory.create({
        data: {
          requestId,
          status: 'QUOTED',
          note: 'Quote provided',
        },
      });

      await tx.outbox.create({
        data: {
          type: 'QUOTE_CREATED',
          aggregateType: 'REQUEST',
          aggregateId: requestId,
          payload: { quoteId: newQuote.id, requestId },
        },
      });

      return newQuote;
    });

    return {
      id: quote.id,
      requestId: quote.requestId,
      status: 'pending',
      amount: { subtotal, taxAmount, totalAmount, currency: dto.currency },
      items: dto.items.map((i) => ({
        description: i.description,
        quantity: i.quantity,
        unitPrice: i.unitPrice,
        totalPrice: i.quantity * i.unitPrice,
      })),
      createdAt: quote.createdAt,
    };
  }
}
