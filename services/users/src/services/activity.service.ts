import { Injectable } from '@nestjs/common';
import { PrismaWriteService, PrismaReadService } from '@nestlancer/database';
import { BusinessLogicException } from '@nestlancer/common';

/**
 * Service for user activity tracking and data export functionality.
 * Queries audit logs for activity history and manages GDPR data export requests.
 */
@Injectable()
export class ActivityService {
  constructor(
    private readonly prismaRead: PrismaReadService,
    private readonly prismaWrite: PrismaWriteService,
  ) {}

  /**
   * Retrieves a paginated activity log for a specific user from the audit trail.
   *
   * @param userId - The ID of the user whose activity to retrieve
   * @param page - Page number for pagination (default: 1)
   * @param limit - Number of records per page (default: 20)
   * @returns Paginated list of audit log entries for the user
   */
  async getActivityLog(userId: string, page: number = 1, limit: number = 20): Promise<any> {
    const skip = (page - 1) * limit;

    const [data, total] = await Promise.all([
      this.prismaRead.auditLog.findMany({
        where: { userId },
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        select: {
          id: true,
          action: true,
          category: true,
          description: true,
          resourceType: true,
          resourceId: true,
          ip: true,
          createdAt: true,
        },
      }),
      this.prismaRead.auditLog.count({ where: { userId } }),
    ]);

    return {
      data,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  /**
   * Queues a data export job for the user (GDPR compliance).
   * Creates an outbox event to trigger asynchronous export processing.
   *
   * @param userId - The ID of the user requesting data export
   * @returns Export job metadata with estimated completion time
   */
  async requestDataExport(userId: string): Promise<any> {
    const exportId = `export_${Date.now()}_${userId.slice(-6)}`;

    await this.prismaWrite.outbox.create({
      data: {
        type: 'USER_DATA_EXPORT_REQUESTED',
        payload: { userId, exportId },
      },
    });

    return {
      exportId,
      status: 'processing',
      message: 'Data export has been queued. You will be notified when it is ready.',
      estimatedCompletion: new Date(Date.now() + 3600000).toISOString(),
    };
  }

  /**
   * Checks the status of a previously requested data export.
   * Looks for a completion audit log entry to determine if the export is ready.
   *
   * @param userId - The ID of the user who requested the export
   * @param exportId - The unique export job identifier
   * @returns Export status with download URL if completed
   */
  async downloadDataExport(userId: string, exportId: string): Promise<any> {
    // Check audit logs for export completion event
    const completionLog = await this.prismaRead.auditLog.findFirst({
      where: {
        userId,
        action: 'DATA_EXPORT_COMPLETED',
        resourceId: exportId,
      },
      orderBy: { createdAt: 'desc' },
    });

    if (completionLog) {
      const metadata = completionLog.metadata as any;
      return {
        exportId,
        status: 'completed',
        downloadUrl: metadata?.downloadUrl || null,
        expiresAt: metadata?.expiresAt || null,
      };
    }

    return {
      exportId,
      status: 'processing',
      downloadUrl: null,
      expiresAt: null,
    };
  }
}
