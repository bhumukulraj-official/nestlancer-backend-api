export enum IncomingWebhookStatus {
  RECEIVED = 'PENDING', // Maps to WebhookIngestionStatus.PENDING
  DISPATCHED = 'PROCESSED', // Maps to WebhookIngestionStatus.PROCESSED
  PROCESSED = 'PROCESSED',
  FAILED = 'FAILED', // Maps to WebhookIngestionStatus.FAILED
  DEAD_LETTERED = 'FAILED', // Maps to WebhookIngestionStatus.FAILED
}

export class IncomingWebhook {
  id: string;
  provider: string;
  eventType: string;
  eventId: string | null;
  rawPayload: Record<string, any>;
  headers: Record<string, string>;
  status: string;
  attempts: number;
  lastError: string | null;
  processedAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
}
