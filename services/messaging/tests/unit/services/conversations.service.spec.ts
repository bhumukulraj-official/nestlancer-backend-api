import { ConversationsService } from '../../../src/services/conversations.service';

describe('ConversationsService', () => {
    let service: ConversationsService;
    let mockPrismaRead: any;

    beforeEach(() => {
        mockPrismaRead = {
            project: {
                findMany: jest.fn().mockResolvedValue([
                    { id: 'proj-1', title: 'Website Build', messages: [{ id: 'msg-1', content: 'Latest message', createdAt: new Date() }] },
                ]),
                count: jest.fn().mockResolvedValue(1),
            },
        };
        service = new ConversationsService(mockPrismaRead);
    });

    describe('getConversations', () => {
        it('should return conversations with latest message', async () => {
            const result = await service.getConversations('user-1', { page: 1, limit: 20 });
            expect(result.items).toHaveLength(1);
            expect(result.items[0].projectId).toBe('proj-1');
            expect(result.items[0].latestMessage).toBeDefined();
        });

        it('should handle empty conversations', async () => {
            mockPrismaRead.project.findMany.mockResolvedValue([]);
            mockPrismaRead.project.count.mockResolvedValue(0);
            const result = await service.getConversations('user-1', { page: 1, limit: 20 });
            expect(result.items).toHaveLength(0);
        });
    });
});
