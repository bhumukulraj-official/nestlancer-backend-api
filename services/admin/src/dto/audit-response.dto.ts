export class AuditLogResponseDto {
    id: string;
    action: string;
    resourceType: string;
    resourceId?: string | null;
    userId?: string | null;
    userEmail?: string;
    dataBefore?: any;
    dataAfter?: any;
    ip?: string | null;
    createdAt: Date;
}
