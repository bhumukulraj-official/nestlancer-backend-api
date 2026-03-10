import { Test, TestingModule } from '@nestjs/testing';
import { MessagesController } from './messages.controller';
import { MessagingService } from '../../services/messaging.service';
import { MessageReactionsService } from '../../services/message-reactions.service';
import { MessageSearchService } from '../../services/message-search.service';
import { MessageReadService } from '../../services/message-read.service';

describe('MessagesController', () => {
  let controller: MessagesController;

  const mockMessagingService = {
    getMessages: jest.fn(),
    sendMessage: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [MessagesController],
      providers: [
        { provide: MessagingService, useValue: mockMessagingService },
        { provide: MessageReactionsService, useValue: {} },
        { provide: MessageSearchService, useValue: {} },
        { provide: MessageReadService, useValue: {} },
      ],
    }).compile();

    controller = module.get<MessagesController>(MessagesController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('getMessages', () => {
    it('should return messages for a project', async () => {
      mockMessagingService.getMessages.mockResolvedValue({ items: [], meta: { total: 0 } });
      const result = await controller.getMessages('p1', {});
      expect(result).toHaveProperty('status', 'success');
      expect(result).toHaveProperty('items');
    });
  });
});
