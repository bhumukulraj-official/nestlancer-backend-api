import { Injectable } from '@nestjs/common';

@Injectable()
export class AuditRepository {
  async create(entry: Record<string, unknown>): Promise<string> { void entry; return 'audit-id'; }
  async findByResource(resourceType: string, resourceId: string): Promise<unknown[]> { void resourceType; void resourceId; return []; }
}
