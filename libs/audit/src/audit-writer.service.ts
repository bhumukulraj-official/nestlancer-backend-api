import { Injectable, Logger } from '@nestjs/common';
import { AuditEntry } from './interfaces/audit-entry.interface';

@Injectable()
export class AuditWriterService {
  private readonly logger = new Logger(AuditWriterService.name);

  async write(entry: AuditEntry): Promise<void> {
    // In production: publishes to audit.queue via outbox pattern
    this.logger.debug(`Audit: ${entry.action} on ${entry.resourceType}:${entry.resourceId} by ${entry.userId}`);
  }
}
