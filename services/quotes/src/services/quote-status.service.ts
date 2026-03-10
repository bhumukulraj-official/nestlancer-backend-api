import { Injectable } from '@nestjs/common';
import { PrismaWriteService, PrismaReadService } from '@nestlancer/database';
import { BusinessLogicException } from '@nestlancer/common';
import { AcceptQuoteDto } from '../dto/accept-quote.dto';
import { DeclineQuoteDto } from '../dto/decline-quote.dto';
import { RequestQuoteChangesDto } from '../dto/request-quote-changes.dto';

@Injectable()
export class QuoteStatusService {
  constructor(
    private readonly prismaWrite: PrismaWriteService,
    private readonly prismaRead: PrismaReadService,
  ) {}

  async acceptQuote(userId: string, quoteId: string, dto: AcceptQuoteDto) {
    const quote = await this.prismaRead.quote.findFirst({
      where: { id: quoteId, userId },
    });

    if (!quote) throw new BusinessLogicException('Quote not found', 'QUOTE_001');

    if (['ACCEPTED', 'DECLINED'].includes(quote.status)) {
      throw new BusinessLogicException('Quote already accepted or declined', 'QUOTE_003');
    }

    if (new Date(quote.validUntil) < new Date()) {
      throw new BusinessLogicException('Quote expired', 'QUOTE_004');
    }

    if (!['SENT', 'VIEWED'].includes(quote.status)) {
      throw new BusinessLogicException('Invalid quote status', 'QUOTE_005');
    }

    const result = await this.prismaWrite.$transaction(async (tx: any) => {
      const accQuote = await tx.quote.update({
        where: { id: quoteId },
        data: {
          status: 'ACCEPTED',
          acceptedAt: new Date(),
          signatureName: dto.signatureName,
          signatureDate: new Date(dto.signatureDate),
          clientNotes: dto.notes,
        },
      });

      await tx.projectRequest.update({
        where: { id: quote.requestId },
        data: { status: 'ACCEPTED' }, // Technically converts to project later
      });

      // Emitting event to spawn Project Service creation
      await tx.outbox.create({
        data: {
          eventType: 'QUOTE_ACCEPTED',
          payload: { quoteId, requestId: quote.requestId, userId },
        },
      });

      return accQuote;
    });

    return {
      quoteId,
      status: 'accepted',
      acceptedAt: result.acceptedAt,
      project: { id: 'pending', status: 'creating' }, // Replaced asynchronously via events
      nextSteps: {
        action: 'paymentRequired',
        description: 'An invoice will be generated shortly.',
      },
    };
  }

  async declineQuote(userId: string, quoteId: string, dto: DeclineQuoteDto) {
    const quote = await this.prismaRead.quote.findFirst({
      where: { id: quoteId, userId },
    });

    if (!quote) throw new BusinessLogicException('Quote not found', 'QUOTE_001');

    if (['ACCEPTED', 'DECLINED'].includes(quote.status)) {
      throw new BusinessLogicException('Quote already processed', 'QUOTE_003');
    }

    await this.prismaWrite.$transaction(async (tx: any) => {
      await tx.quote.update({
        where: { id: quoteId },
        data: {
          status: 'DECLINED',
          declinedAt: new Date(),
          declineReason: dto.reason,
          clientNotes: dto.feedback,
        },
      });

      await tx.projectRequest.update({
        where: { id: quote.requestId },
        data: { status: 'REJECTED' },
      });

      await tx.outbox.create({
        data: {
          eventType: 'QUOTE_DECLINED',
          payload: { quoteId, requestId: quote.requestId, reason: dto.reason },
        },
      });
    });

    return {
      quoteId,
      status: 'declined',
      declinedAt: new Date(),
      reason: dto.reason,
      revisionRequested: dto.requestRevision,
    };
  }

  async requestChanges(userId: string, quoteId: string, dto: RequestQuoteChangesDto) {
    const quote = await this.prismaRead.quote.findFirst({
      where: { id: quoteId, userId },
    });

    if (!quote) throw new BusinessLogicException('Quote not found', 'QUOTE_001');

    if (['ACCEPTED', 'DECLINED'].includes(quote.status)) {
      throw new BusinessLogicException('Cannot modify accepted/declined quote', 'QUOTE_006');
    }

    await this.prismaWrite.$transaction(async (tx: any) => {
      await tx.quote.update({
        where: { id: quoteId },
        data: {
          status: 'CHANGES_REQUESTED',
          clientNotes: JSON.stringify(dto),
        },
      });

      await tx.projectRequest.update({
        where: { id: quote.requestId },
        data: { status: 'CHANGES_REQUESTED' },
      });

      await tx.outbox.create({
        data: {
          eventType: 'QUOTE_CHANGES_REQUESTED',
          payload: { quoteId, changes: dto.changes },
        },
      });
    });

    const estimatedRevisionDate = new Date();
    estimatedRevisionDate.setDate(estimatedRevisionDate.getDate() + 1);

    return {
      quoteId,
      status: 'changesRequested',
      requestedAt: new Date(),
      estimatedRevisionDate,
    };
  }
}
