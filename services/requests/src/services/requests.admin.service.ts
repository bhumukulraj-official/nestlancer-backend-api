import { Injectable } from '@nestjs/common';
import { PrismaWriteService, PrismaReadService } from '@nestlancer/database';
import { BusinessLogicException } from '@nestlancer/common';

@Injectable()
export class RequestsAdminService {
  constructor(
    private readonly prismaWrite: PrismaWriteService,
    private readonly prismaRead: PrismaReadService,
  ) {}

  async listRequests(page: number, limit: number, status?: string) {
    const where: any = { deletedAt: null };
    if (status) {
      where.status = status.replace(/([A-Z])/g, '_$1').toUpperCase(); // underReview -> UNDER_REVIEW
    }

    const [requests, total] = await Promise.all([
      this.prismaRead.projectRequest.findMany({
        where,
        skip: (page - 1) * limit,
        take: limit,
        orderBy: { updatedAt: 'desc' },
        include: { user: { select: { id: true, email: true, firstName: true, lastName: true } } },
      }),
      this.prismaRead.projectRequest.count({ where }),
    ]);

    return {
      data: requests.map((req: any) => ({
        id: req.id,
        title: req.title,
        status: req.status
          .toLowerCase()
          .replace(/_([a-z])/g, (_match: string, g: string) => g.toUpperCase()),
        user: req.user,
        category: req.category,
        createdAt: req.createdAt,
        submittedAt: req.submittedAt,
      })),
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async getRequestDetailsAdmin(requestId: string) {
    const request = await this.prismaRead.projectRequest.findFirst({
      where: { id: requestId, deletedAt: null },
      include: {
        user: { select: { id: true, email: true, firstName: true, lastName: true } },
        attachments: true,
        quote: true,
        statusHistory: { orderBy: { createdAt: 'desc' } },
        adminNotes: {
          orderBy: { createdAt: 'desc' },
          include: { author: { select: { id: true, firstName: true, lastName: true } } },
        } as any,
      } as any,
    });

    if (!request) throw new BusinessLogicException('Request not found', 'REQUEST_001');

    return this.formatAdminRequestResponse(request as any);
  }

  async updateRequestStatus(requestId: string, adminId: string, status: string, notes?: string) {
    const request = await this.prismaRead.projectRequest.findFirst({
      where: { id: requestId, deletedAt: null },
    });

    if (!request) throw new BusinessLogicException('Request not found', 'REQUEST_001');

    const dbStatus = status.replace(/([A-Z])/g, '_$1').toUpperCase(); // e.g. underReview -> UNDER_REVIEW

    // Basic state machine validation could go here
    if (dbStatus === 'SUBMITTED' && request.status === 'QUOTED') {
      throw new BusinessLogicException('Invalid status transition', 'REQUEST_005');
    }

    const updated = await this.prismaWrite.$transaction(async (tx: any) => {
      const updatedReq = await tx.projectRequest.update({
        where: { id: requestId },
        data: { status: dbStatus as any },
      });

      await tx.requestStatusHistory.create({
        data: {
          requestId,
          status: dbStatus as any,
          note: notes || `Status updated to ${status}`,
        },
      });

      await tx.outbox.create({
        data: {
          type: 'REQUEST_STATUS_UPDATED',
          payload: { requestId, oldStatus: request.status, newStatus: dbStatus },
        },
      });

      return updatedReq;
    });

    return {
      id: updated.id,
      status, // return camelCase
      previousStatus: request.status
        .toLowerCase()
        .replace(/_([a-z])/g, (_match: string, g: string) => g.toUpperCase()),
      updatedAt: updated.updatedAt,
    };
  }

  async addNote(requestId: string, adminId: string, content: string) {
    const request = await this.prismaRead.projectRequest.findFirst({
      where: { id: requestId, deletedAt: null },
    });

    if (!request) throw new BusinessLogicException('Request not found', 'REQUEST_001');

    const note = await this.prismaWrite.adminNote.create({
      data: {
        requestId,
        authorId: adminId,
        content,
      },
      include: {
        author: { select: { id: true, firstName: true, lastName: true } },
      },
    });

    return {
      id: note.id,
      content: note.content,
      author: note.author,
      createdAt: note.createdAt,
    };
  }

  async getNotes(requestId: string) {
    const notes = await this.prismaRead.adminNote.findMany({
      where: { requestId },
      orderBy: { createdAt: 'desc' },
      include: { author: { select: { id: true, firstName: true, lastName: true } } },
    });

    return notes.map((n: any) => ({
      id: n.id,
      content: n.content,
      author: n.author,
      createdAt: n.createdAt,
    }));
  }

  private formatAdminRequestResponse(req: any) {
    return {
      // Similar to user response, but includes user details and admin notes
      id: req.id,
      title: req.title,
      description: req.description,
      user: req.user,
      status: req.status
        .toLowerCase()
        .replace(/_([a-z])/g, (_match: string, g: string) => g.toUpperCase()),
      budget: { min: req.budgetMin, max: req.budgetMax, currency: req.budgetCurrency },
      timeline: { preferredStartDate: req.preferredStartDate, deadline: req.deadline },
      requirements: req.requirements,
      technicalRequirements: req.technicalRequirements,
      attachments:
        req.attachments?.map((a: any) => ({ id: a.id, filename: a.filename, url: a.fileUrl })) ||
        [],
      quotes:
        req.quote
          ? [
              {
                id: req.quote.id,
                status: req.quote.status.toLowerCase(),
                totalAmount: req.quote.totalAmount,
              },
            ]
          : [],
      statusHistory:
        req.statusHistory?.map((sh: any) => ({
          status: sh.status
            .toLowerCase()
            .replace(/_([a-z])/g, (_match: string, g: string) => g.toUpperCase()),
          timestamp: sh.createdAt,
          note: sh.note,
        })) || [],
      adminNotes:
        req.adminNotes?.map((an: any) => ({
          id: an.id,
          content: an.content,
          author: an.author,
          createdAt: an.createdAt,
        })) || [],
      createdAt: req.createdAt,
      updatedAt: req.updatedAt,
    };
  }
}
