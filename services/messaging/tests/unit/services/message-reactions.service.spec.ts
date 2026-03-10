import { Test, TestingModule } from '@nestjs/testing';
import { MessageReactionsService } from '../../../src/services/message-reactions.service';
import { PrismaWriteService, PrismaReadService } from '@nestlancer/database';
import { NotFoundException } from '@nestjs/common';
import { MessageReactionDto } from '../../../src/dto/message-reaction.dto';

describe('MessageReactionsService', () => {
  let service: MessageReactionsService;
  let prismaWrite: jest.Mocked<PrismaWriteService>;
  let prismaRead: jest.Mocked<PrismaReadService>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        MessageReactionsService,
        {
          provide: PrismaWriteService,
          useValue: {
            message: { update: jest.fn() },
          },
        },
        {
          provide: PrismaReadService,
          useValue: {
            message: { findUnique: jest.fn() },
          },
        },
      ],
    }).compile();

    service = module.get<MessageReactionsService>(MessageReactionsService);
    prismaWrite = module.get(PrismaWriteService);
    prismaRead = module.get(PrismaReadService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('toggleReaction', () => {
    it('should throw NotFoundException if message not found', async () => {
      prismaRead.message.findUnique.mockResolvedValue(null);
      await expect(service.toggleReaction('u1', 'm1', { emoji: '👍' })).rejects.toThrow(
        NotFoundException,
      );
    });

    it('should add reaction if user has not reacted with that emoji', async () => {
      prismaRead.message.findUnique.mockResolvedValue({ id: 'm1', reactions: [] } as any);
      prismaWrite.message.update.mockResolvedValue({
        id: 'm1',
        reactions: [{ userId: 'u1', emoji: '👍' }],
      } as any);

      const dto: MessageReactionDto = { emoji: '👍' };
      const result = await service.toggleReaction('u1', 'm1', dto);

      expect(prismaWrite.message.update).toHaveBeenCalled();
      // Check that reactions array sent to update contains new reaction
      const updatedReactions = prismaWrite.message.update.mock.calls[0][0].data.reactions as any[];
      expect(updatedReactions).toHaveLength(1);
      expect(updatedReactions[0].emoji).toBe('👍');
      expect(result).toHaveLength(1);
    });

    it('should remove reaction if user has already reacted with that emoji', async () => {
      prismaRead.message.findUnique.mockResolvedValue({
        id: 'm1',
        reactions: [{ userId: 'u1', emoji: '👍' }],
      } as any);
      prismaWrite.message.update.mockResolvedValue({ id: 'm1', reactions: [] } as any);

      const dto: MessageReactionDto = { emoji: '👍' };
      const result = await service.toggleReaction('u1', 'm1', dto);

      expect(prismaWrite.message.update).toHaveBeenCalled();
      // Check that reactions array sent to update is empty
      const updatedReactions = prismaWrite.message.update.mock.calls[0][0].data.reactions as any[];
      expect(updatedReactions).toHaveLength(0);
      expect(result).toHaveLength(0);
    });
  });
});
