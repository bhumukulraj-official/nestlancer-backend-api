export interface AuditEntry {
    action: string;
    category: string;
    description: string;
    resourceType?: string;
    resourceId?: string;
    userId?: string;
    metadata?: Record<string, any>;
    ip?: string;
    userAgent?: string;
    impersonatedBy?: string;
    createdAt?: string | Date;
}
