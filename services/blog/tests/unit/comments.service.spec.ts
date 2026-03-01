import { CommentsService } from '../../src/services/comments.service';

describe('CommentsService', () => {
    let service: CommentsService;
    let mockPrismaWrite: any;
    let mockPrismaRead: any;
    let mockModerationService: any;

    beforeEach(() => {
        mockPrismaRead = {};
        mockPrismaWrite = {};
        mockModerationService = { checkContent: jest.fn().mockResolvedValue(true) };
        service = new CommentsService(mockPrismaWrite, mockPrismaRead, mockModerationService);
    });

    describe('create', () => {
        it('should create approved comment when content is clean', async () => {
            const result = await service.create('test-post', 'user-1', { content: 'Great post!' } as any);
            expect(result.status).toBe('APPROVED');
        });

        it('should create pending comment when content flagged', async () => {
            mockModerationService.checkContent.mockResolvedValue(false);
            const result = await service.create('test-post', 'user-1', { content: 'Bad content' } as any);
            expect(result.status).toBe('PENDING');
        });
    });

    describe('update', () => {
        it('should update comment content', async () => {
            const result = await service.update('cmt-1', 'user-1', { content: 'Updated' } as any);
            expect(result.content).toBe('Updated');
        });
    });

    describe('softDelete', () => {
        it('should soft delete comment', async () => {
            const result = await service.softDelete('cmt-1', 'user-1');
            expect(result.deleted).toBe(true);
        });
    });
});
