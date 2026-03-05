import { Test, TestingModule } from '@nestjs/testing';
import { PaymentCapturedHandler } from '../../../../src/handlers/razorpay/payment-captured.handler';
import { PrismaWriteService } from '@nestlancer/database';
import { LoggerService } from '@nestlancer/logger';
import { QueuePublisherService } from '@nestlancer/queue';

describe('PaymentCapturedHandler', () => {
  let handler: PaymentCapturedHandler;
  let prismaWrite: jest.Mocked<PrismaWriteService>;
  let logger: jest.Mocked<LoggerService>;
  let queue: jest.Mocked<QueuePublisherService>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        PaymentCapturedHandler,
        {
          provide: PrismaWriteService,
          useValue: {
            payment: { findFirst: jest.fn(), update: jest.fn() },
            $transaction: jest.fn(),
          },
        },
        {
          provide: LoggerService,
          useValue: { log: jest.fn(), error: jest.fn(), warn: jest.fn() },
        },
        {
          provide: QueuePublisherService,
          useValue: { publish: jest.fn() },
        },
      ],
    }).compile();

    handler = module.get<PaymentCapturedHandler>(PaymentCapturedHandler);
    prismaWrite = module.get(PrismaWriteService);
    logger = module.get(LoggerService);
    queue = module.get(QueuePublisherService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(handler).toBeDefined();
  });

  describe('canHandle', () => {
    it('should return true for razorpay payment.captured events', () => {
      expect(handler.canHandle('razorpay', 'payment.captured')).toBe(true);
    });

    it('should return false for other providers', () => {
      expect(handler.canHandle('github', 'payment.captured')).toBe(false);
    });

    it('should return false for other event types', () => {
      expect(handler.canHandle('razorpay', 'payment.failed')).toBe(false);
    });
  });

  describe('handle', () => {
    const payload = {
      payment: { entity: { id: 'pay_123' } },
    };

    it('should return early if payment not found', async () => {
      prismaWrite.payment.findFirst.mockResolvedValue(null);

      await handler.handle(payload);

      expect(logger.error).toHaveBeenCalledWith(
        'Payment not found for external ID: pay_123',
      );
      expect(prismaWrite.$transaction).not.toHaveBeenCalled();
    });

    it('should return early and warn if payment already COMPLETED', async () => {
      prismaWrite.payment.findFirst.mockResolvedValue({
        id: 'payment-1',
        status: 'COMPLETED',
        clientId: 'user-1',
        amount: 1000,
      } as any);

      await handler.handle(payload);

      expect(logger.warn).toHaveBeenCalledWith(
        'Payment payment-1 already captured, skipping.',
      );
      expect(prismaWrite.$transaction).not.toHaveBeenCalled();
    });

    it('should update payment and publish notification on success', async () => {
      const payment = {
        id: 'payment-1',
        status: 'PENDING',
        clientId: 'user-1',
        amount: 1000,
      };
      prismaWrite.payment.findFirst.mockResolvedValue(payment as any);
      prismaWrite.$transaction.mockResolvedValue([{}] as any);
      queue.publish.mockResolvedValue(undefined);

      await handler.handle(payload);

      expect(logger.log).toHaveBeenCalledWith(
        'Handling payment.captured for Razorpay ID: pay_123',
      );
      expect(prismaWrite.$transaction).toHaveBeenCalled();
      expect(queue.publish).toHaveBeenCalledWith(
        'events',
        'notification.payment.completed',
        {
          type: 'payment.completed',
          userId: 'user-1',
          payload: { paymentId: 'payment-1', amount: 1000 },
        },
      );
    });
  });
});
