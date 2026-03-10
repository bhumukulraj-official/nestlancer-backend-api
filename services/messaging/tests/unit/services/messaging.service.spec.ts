import { MessagingService } from '../../../src/services/messaging.service';

describe('MessagingService', () => {
  let service: MessagingService;
  let mockPrismaWrite: any;
  let mockPrismaRead: any;
  let mockOutbox: any;

  beforeEach(() => {
    mockPrismaRead = {
      message: {
        findMany: jest
          .fn()
          .mockResolvedValue([{ id: 'msg-1', content: 'Hello', senderId: 'user-1' }]),
        count: jest.fn().mockResolvedValue(1),
        findUnique: jest
          .fn()
          .mockResolvedValue({
            id: 'msg-1',
            content: 'Hello',
            senderId: 'user-1',
            deletedAt: null,
          }),
      },
    };
    mockPrismaWrite = {
      $transaction: jest.fn().mockImplementation(async (fn: any) => {
        const tx = {
          message: {
            create: jest
              .fn()
              .mockResolvedValue({
                id: 'msg-new',
                projectId: 'proj-1',
                senderId: 'user-1',
                content: 'Test',
              }),
          },
          outbox: { create: jest.fn().mockResolvedValue({}) },
        };
        return fn(tx);
      }),
      message: {
        update: jest
          .fn()
          .mockResolvedValue({ id: 'msg-1', content: 'Updated', editedAt: new Date() }),
      },
    };
    mockOutbox = {};
    service = new MessagingService(mockPrismaWrite, mockPrismaRead, mockOutbox);
  });

  describe('sendMessage', () => {
    it('should send a text message', async () => {
      const result = await service.sendMessage('user-1', {
        projectId: 'proj-1',
        content: 'Test',
        type: 'TEXT',
      } as any);
      expect(result.id).toBe('msg-new');
      expect(mockPrismaWrite.$transaction).toHaveBeenCalled();
    });

    it('should throw for empty text message content', async () => {
      await expect(
        service.sendMessage('user-1', { projectId: 'proj-1', content: '', type: 'TEXT' } as any),
      ).rejects.toThrow();
    });
  });

  describe('getMessages', () => {
    it('should return paginated messages', async () => {
      const result = await service.getMessages('proj-1', { page: 1, limit: 50 });
      expect(result.items).toHaveLength(1);
      expect(result.meta.total).toBe(1);
    });
  });

  describe('updateMessage', () => {
    it('should update own message', async () => {
      const result = await service.updateMessage('user-1', 'msg-1', { content: 'Updated' } as any);
      expect(result.content).toBe('Updated');
    });

    it("should throw when editing someone else's message", async () => {
      mockPrismaRead.message.findUnique.mockResolvedValue({
        id: 'msg-1',
        senderId: 'other-user',
        deletedAt: null,
      });
      await expect(
        service.updateMessage('user-1', 'msg-1', { content: 'Updated' } as any),
      ).rejects.toThrow();
    });
  });

  describe('deleteMessage', () => {
    it('should soft-delete own message', async () => {
      await service.deleteMessage('user-1', 'msg-1');
      expect(mockPrismaWrite.message.update).toHaveBeenCalledWith(
        expect.objectContaining({ data: expect.objectContaining({ content: null }) }),
      );
    });

    it("should throw when deleting someone else's message", async () => {
      mockPrismaRead.message.findUnique.mockResolvedValue({ id: 'msg-1', senderId: 'other-user' });
      await expect(service.deleteMessage('user-1', 'msg-1')).rejects.toThrow();
    });
  });
});
