import { Injectable } from '@nestjs/common';
import { PrismaWriteService, PrismaReadService } from '@nestlancer/database';
import { BusinessLogicException } from '@nestlancer/common';
import { CreateRequestDto } from '../dto/create-request.dto';
import { UpdateRequestDto } from '../dto/update-request.dto';

@Injectable()
export class RequestsService {
    constructor(
        private readonly prismaWrite: PrismaWriteService,
        private readonly prismaRead: PrismaReadService,
    ) { }

    async createRequest(userId: string, dto: CreateRequestDto) {
        const request = await this.prismaWrite.$transaction(async (tx: any) => {
            const newReq = await tx.projectRequest.create({
                data: {
                    userId,
                    title: dto.title,
                    description: dto.description,
                    category: dto.category,
                    budgetMin: dto.budget.min,
                    budgetMax: dto.budget.max,
                    budgetCurrency: dto.budget.currency,
                    budgetFlexible: dto.budget.flexible,
                    preferredStartDate: new Date(dto.timeline.preferredStartDate),
                    deadline: new Date(dto.timeline.deadline),
                    timelineFlexible: dto.timeline.flexible,
                    requirements: dto.requirements,
                    technicalRequirements: dto.technicalRequirements ? JSON.parse(JSON.stringify(dto.technicalRequirements)) : null,
                    additionalInfo: dto.additionalInfo,
                    status: 'DRAFT',
                }
            });

            await tx.requestStatusHistory.create({
                data: {
                    requestId: newReq.id,
                    status: 'DRAFT',
                    note: 'Request created',
                }
            });

            return newReq;
        });

        return this.formatRequestResponse(request);
    }

    async getMyRequests(userId: string) {
        const requests = await this.prismaRead.projectRequest.findMany({
            where: { userId, deletedAt: null },
            orderBy: { updatedAt: 'desc' }
        });

        return requests.map(this.formatRequestSummary);
    }

    async getRequestDetails(userId: string, requestId: string) {
        const request = await this.prismaRead.projectRequest.findFirst({
            where: { id: requestId, userId, deletedAt: null },
            include: {
                attachments: true,
                quote: {
                    select: { id: true, status: true, totalAmount: true, createdAt: true }
                },
                statusHistory: {
                    orderBy: { createdAt: 'desc' }
                }
            } as any
        });

        if (!request) {
            throw new BusinessLogicException('Request not found', 'REQUEST_001');
        }

        return this.formatRequestDetailResponse(request as any);
    }

    async updateRequest(userId: string, requestId: string, dto: UpdateRequestDto) {
        const request = await this.prismaRead.projectRequest.findFirst({
            where: { id: requestId, userId, deletedAt: null }
        });

        if (!request) {
            throw new BusinessLogicException('Request not found', 'REQUEST_001');
        }

        if (request.status !== 'DRAFT' && request.status !== 'CHANGES_REQUESTED') {
            throw new BusinessLogicException('Cannot modify submitted request', 'REQUEST_003');
        }

        const updateData: any = {};
        if (dto.title) updateData.title = dto.title;
        if (dto.description) updateData.description = dto.description;
        if (dto.category) updateData.category = dto.category;
        if (dto.budget) {
            updateData.budgetMin = dto.budget.min;
            updateData.budgetMax = dto.budget.max;
            updateData.budgetCurrency = dto.budget.currency;
            updateData.budgetFlexible = dto.budget.flexible;
        }
        if (dto.timeline) {
            updateData.preferredStartDate = new Date(dto.timeline.preferredStartDate);
            updateData.deadline = new Date(dto.timeline.deadline);
            updateData.timelineFlexible = dto.timeline.flexible;
        }
        if (dto.requirements) updateData.requirements = dto.requirements;
        if (dto.technicalRequirements) updateData.technicalRequirements = JSON.parse(JSON.stringify(dto.technicalRequirements));
        if (dto.additionalInfo !== undefined) updateData.additionalInfo = dto.additionalInfo;

        const updated = await this.prismaWrite.projectRequest.update({
            where: { id: requestId },
            data: updateData
        });

        return this.formatRequestResponse(updated as any);
    }

    async submitRequest(userId: string, requestId: string) {
        const request = await this.prismaRead.projectRequest.findFirst({
            where: { id: requestId, userId, deletedAt: null }
        });

        if (!request) {
            throw new BusinessLogicException('Request not found', 'REQUEST_001');
        }

        if (request.status !== 'DRAFT' && request.status !== 'CHANGES_REQUESTED') {
            throw new BusinessLogicException('Invalid status transition', 'REQUEST_005');
        }

        // Basic validation to ensure required fields exist before submitting
        if (!(request as any).budgetMin || !(request as any).deadline) {
            throw new BusinessLogicException('Cannot submit incomplete request', 'REQUEST_009', {
                missingFields: ['budget', 'timeline']
            });
        }

        const estimatedQuoteDate = new Date();
        estimatedQuoteDate.setDate(estimatedQuoteDate.getDate() + 2); // 48 hour SLA

        await this.prismaWrite.$transaction(async (tx: any) => {
            await tx.projectRequest.update({
                where: { id: requestId },
                data: {
                    status: 'SUBMITTED',
                    submittedAt: new Date(),
                }
            });

            await tx.requestStatusHistory.create({
                data: {
                    requestId,
                    status: 'SUBMITTED',
                    note: 'Submitted for review',
                }
            });

            await tx.outbox.create({
                data: {
                    type: 'REQUEST_SUBMITTED',
                    payload: { requestId, userId, category: request.category }
                }
            });
        });

        return {
            id: requestId,
            status: 'submitted',
            submittedAt: new Date(),
            estimatedQuoteDate
        };
    }

    async deleteRequest(userId: string, requestId: string) {
        const request = await this.prismaRead.projectRequest.findFirst({
            where: { id: requestId, userId, deletedAt: null }
        });

        if (!request) {
            throw new BusinessLogicException('Request not found', 'REQUEST_001');
        }

        if (request.status !== 'DRAFT') {
            throw new BusinessLogicException('Cannot delete non-draft request', 'REQUEST_004');
        }

        await this.prismaWrite.projectRequest.update({
            where: { id: requestId },
            data: { deletedAt: new Date() }
        });

        return true;
    }

    // Helpers
    private formatRequestSummary(req: any) {
        return {
            id: req.id,
            title: req.title,
            status: req.status.toLowerCase().replace(/_([a-z])/g, (_match: string, g: string) => g.toUpperCase()), // DRAFT -> draft, UNDER_REVIEW -> underReview
            category: req.category,
            createdAt: req.createdAt,
            submittedAt: req.submittedAt
        };
    }

    private formatRequestResponse(req: any) {
        return {
            ...this.formatRequestSummary(req),
            expiresAt: null // Logic for expiration if draft sits too long
        };
    }

    private formatRequestDetailResponse(req: any) {
        return {
            id: req.id,
            title: req.title,
            description: req.description,
            category: req.category,
            status: req.status.toLowerCase().replace(/_([a-z])/g, (_match: string, g: string) => g.toUpperCase()),
            budget: {
                min: req.budgetMin,
                max: req.budgetMax,
                currency: req.budgetCurrency,
                flexible: req.budgetFlexible
            },
            timeline: {
                preferredStartDate: req.preferredStartDate,
                deadline: req.deadline,
                flexible: req.timelineFlexible
            },
            requirements: req.requirements,
            technicalRequirements: req.technicalRequirements,
            attachments: req.attachments?.map((a: any) => ({
                id: a.id,
                filename: a.filename,
                url: a.fileUrl,
                type: a.mimeType,
                size: a.size
            })) || [],
            quotes: req.quote ? [{
                id: req.quote.id,
                status: req.quote.status.toLowerCase(),
                totalAmount: req.quote.totalAmount,
                createdAt: req.quote.createdAt
            }] : [],
            statusHistory: req.statusHistory?.map((sh: any) => ({
                status: sh.status.toLowerCase().replace(/_([a-z])/g, (_match: string, g: string) => g.toUpperCase()),
                timestamp: sh.createdAt,
                note: sh.note
            })) || [],
            createdAt: req.createdAt,
            updatedAt: req.updatedAt,
            submittedAt: req.submittedAt
        };
    }
}
