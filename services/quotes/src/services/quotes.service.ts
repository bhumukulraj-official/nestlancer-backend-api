import { Injectable } from '@nestjs/common';
import { PrismaWriteService, PrismaReadService } from '@nestlancer/database';
import { BusinessLogicException, QuoteStatus } from '@nestlancer/common';

interface QuoteSummary {
  id: string;
  requestId: string;
  requestTitle?: string;
  status: string;
  totalAmount: number;
  currency: string;
  validUntil: Date;
  createdAt: Date;
}

interface QuoteTimeline {
  estimatedStartDate?: Date;
  estimatedEndDate?: Date;
  phases?: Array<{
    name: string;
    duration: string;
    description?: string;
  }>;
}

interface QuoteScope {
  included: string[];
  excluded: string[];
}

interface QuoteDetail {
  id: string;
  requestId: string;
  status: string;
  title: string;
  description: string;
  totalAmount: number;
  currency: string;
  validUntil: Date;
  daysRemaining: number;
  paymentBreakdown: Array<{
    milestone: string;
    amount: number;
    percentage: number;
    dueOn: string;
  }>;
  timeline: QuoteTimeline;
  scope: QuoteScope;
  technicalDetails: Record<string, unknown>;
  terms?: string;
  attachments: Array<{
    id: string;
    name: string;
    url: string;
  }>;
  request: {
    id: string;
    title: string;
    status: string;
    createdAt: Date;
  };
  statusHistory: Array<{
    status: string;
    timestamp: Date;
    actor?: string;
  }>;
  createdAt: Date;
  updatedAt: Date;
  sentAt?: Date;
  viewedAt?: Date;
  acceptedAt?: Date;
  declinedAt?: Date;
}

@Injectable()
export class QuotesService {
  constructor(
    private readonly prismaWrite: PrismaWriteService,
    private readonly prismaRead: PrismaReadService,
  ) {}

  async getMyQuotes(userId: string): Promise<QuoteSummary[]> {
    const quotes = await this.prismaRead.quote.findMany({
      where: {
        request: { userId },
        status: { notIn: [QuoteStatus.DRAFT, QuoteStatus.PENDING] },
      },
      include: {
        request: { select: { title: true, category: true } },
      },
      orderBy: { createdAt: 'desc' },
    });

    return quotes.map((quote) => this.formatQuoteSummary(quote));
  }

  async getQuoteDetails(userId: string, quoteId: string): Promise<QuoteDetail> {
    const quote = await this.prismaRead.quote.findFirst({
      where: {
        id: quoteId,
        request: { userId },
        status: { notIn: [QuoteStatus.DRAFT, QuoteStatus.PENDING] },
      },
      include: {
        request: { select: { id: true, title: true, status: true, createdAt: true } },
      },
    });

    if (!quote) {
      throw new BusinessLogicException('Quote not found', 'QUOTE_001');
    }

    // Mark as viewed if sent but not yet viewed
    if (quote.status === QuoteStatus.SENT) {
      await this.prismaWrite.quote.update({
        where: { id: quoteId },
        data: { status: QuoteStatus.VIEWED },
      });
    }

    return this.formatQuoteDetailResponse(quote);
  }

  private formatQuoteSummary(quote: any): QuoteSummary {
    return {
      id: quote.id,
      requestId: quote.requestId,
      requestTitle: quote.request?.title,
      status: this.formatStatusString(quote.status),
      totalAmount: quote.totalAmount,
      currency: quote.currency,
      validUntil: quote.validUntil,
      createdAt: quote.createdAt,
    };
  }

  private formatQuoteDetailResponse(quote: any): QuoteDetail {
    const timeline = this.parseJsonField<QuoteTimeline>(quote.timeline, {});
    const scope = this.parseJsonField<QuoteScope>(quote.scope, { included: [], excluded: [] });
    const technicalDetails = this.parseJsonField<Record<string, unknown>>(
      quote.technicalDetails,
      {},
    );
    const paymentBreakdown = this.buildPaymentBreakdown(quote);

    return {
      id: quote.id,
      requestId: quote.requestId,
      status: this.formatStatusString(quote.status),
      title: quote.title || quote.request?.title || `Quote for Request ${quote.requestId}`,
      description: quote.description || '',
      totalAmount: quote.totalAmount,
      currency: quote.currency,
      validUntil: quote.validUntil,
      daysRemaining: this.calculateDaysRemaining(quote.validUntil),
      paymentBreakdown,
      timeline,
      scope,
      technicalDetails,
      terms: quote.terms,
      attachments: this.parseJsonField<Array<{ id: string; name: string; url: string }>>(
        quote.attachments,
        [],
      ),
      request: {
        id: quote.request?.id,
        title: quote.request?.title,
        status: this.formatStatusString(quote.request?.status),
        createdAt: quote.request?.createdAt,
      },
      statusHistory: this.buildStatusHistory(quote),
      createdAt: quote.createdAt,
      updatedAt: quote.updatedAt,
      sentAt: quote.createdAt, // When quote was first sent
      viewedAt: quote.status !== QuoteStatus.SENT ? quote.updatedAt : undefined,
      acceptedAt: quote.acceptedAt,
      declinedAt: quote.declinedAt,
    };
  }

  private formatStatusString(status: string): string {
    if (!status) return '';
    return status.toLowerCase().replace(/_([a-z])/g, (_, letter) => letter.toUpperCase());
  }

  private calculateDaysRemaining(validUntil: Date): number {
    const now = new Date().getTime();
    const expiry = new Date(validUntil).getTime();
    return Math.max(0, Math.ceil((expiry - now) / (1000 * 60 * 60 * 24)));
  }

  private parseJsonField<T>(field: unknown, defaultValue: T): T {
    if (!field) return defaultValue;
    if (typeof field === 'object') return field as T;
    try {
      return JSON.parse(field as string) as T;
    } catch {
      return defaultValue;
    }
  }

  private buildPaymentBreakdown(
    quote: any,
  ): Array<{ milestone: string; amount: number; percentage: number; dueOn: string }> {
    const breakdown = this.parseJsonField<
      Array<{ milestone: string; amount: number; percentage: number; dueOn: string }>
    >(quote.paymentBreakdown, []);

    // If no breakdown exists, create a default one
    if (breakdown.length === 0 && quote.totalAmount > 0) {
      return [
        {
          milestone: 'Initial Payment',
          amount: Math.round(quote.totalAmount * 0.5),
          percentage: 50,
          dueOn: 'Upon acceptance',
        },
        {
          milestone: 'Final Payment',
          amount: Math.round(quote.totalAmount * 0.5),
          percentage: 50,
          dueOn: 'Upon completion',
        },
      ];
    }

    return breakdown;
  }

  private buildStatusHistory(
    quote: any,
  ): Array<{ status: string; timestamp: Date; actor?: string }> {
    const history: Array<{ status: string; timestamp: Date; actor?: string }> = [];

    // Build history from available timestamps
    history.push({ status: 'created', timestamp: quote.createdAt });

    if (quote.status !== QuoteStatus.DRAFT && quote.status !== QuoteStatus.PENDING) {
      history.push({ status: 'sent', timestamp: quote.createdAt });
    }

    if (
      quote.status === QuoteStatus.VIEWED ||
      quote.status === QuoteStatus.ACCEPTED ||
      quote.status === QuoteStatus.DECLINED
    ) {
      history.push({ status: 'viewed', timestamp: quote.updatedAt });
    }

    if (quote.acceptedAt) {
      history.push({ status: 'accepted', timestamp: quote.acceptedAt });
    }

    if (quote.declinedAt) {
      history.push({ status: 'declined', timestamp: quote.declinedAt });
    }

    return history.sort(
      (a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime(),
    );
  }
}
