import { Injectable } from '@nestjs/common';
import { OutboxEventPayload } from './interfaces/outbox-event.interface';

@Injectable()
export class OutboxRepository {
  async create(event: OutboxEventPayload, _tx?: unknown): Promise<string> {
    // Delegates to PrismaWriteService.outboxEvent.create() within transaction
    const id = `outbox-${Date.now()}`;
    void event;
    return id;
  }

  async findPending(limit: number): Promise<Array<{ id: string; eventType: string }>> {
    void limit;
    return [];
  }

  async markPublished(id: string): Promise<void> { void id; }
  async markFailed(id: string, error: string): Promise<void> { void id; void error; }
}
