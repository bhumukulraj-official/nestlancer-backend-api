import { Test, TestingModule } from '@nestjs/testing';
import { PaymentConfirmationService } from '../../../src/services/payment-confirmation.service';
import { PrismaWriteService, PrismaReadService } from '@nestlancer/database';
import { RazorpayService } from '../../../src/services/razorpay.service';
import { OutboxService } from '@nestlancer/outbox';
import { BadRequestException } from '@nestjs/common';
import { PaymentStatus } from '../../../src/interfaces/payments.interface';

describe('PaymentConfirmationService', () => {
  let service: PaymentConfirmationService;
  let prismaWrite: jest.Mocked<PrismaWriteService>;
  let prismaRead: jest.Mocked<PrismaReadService>;
  let razorpayService: jest.Mocked<RazorpayService>;
  let outboxService: jest.Mocked<OutboxService>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        PaymentConfirmationService,
        {
          provide: PrismaWriteService,
          useValue: {
            $transaction: jest.fn(),
            payment: { update: jest.fn() },
          },
        },
        {
          provide: PrismaReadService,
          useValue: {
            payment: { findUnique: jest.fn() },
          },
        },
        {
          provide: RazorpayService,
          useValue: {
            verifyPaymentSignature: jest.fn(),
          },
        },
        {
          provide: OutboxService,
          useValue: {
            create: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<PaymentConfirmationService>(PaymentConfirmationService);
    prismaWrite = module.get(PrismaWriteService);
    prismaRead = module.get(PrismaReadService);
    razorpayService = module.get(RazorpayService);
    outboxService = module.get(OutboxService);

    prismaWrite.$transaction.mockImplementation(async (cb: any) => {
      return cb({
        payment: prismaWrite.payment,
        outbox: outboxService,
      });
    });
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('confirm', () => {
    it('should throw BadRequestException if signature is invalid', async () => {
      razorpayService.verifyPaymentSignature.mockReturnValue(false);
      await expect(
        service.confirm('user1', {
          paymentIntentId: 'pi_1',
          externalPaymentId: 'pay_1',
          signature: 'sig_1',
        }),
      ).rejects.toThrow(BadRequestException);
    });

    it('should throw BadRequestException if payment not found', async () => {
      razorpayService.verifyPaymentSignature.mockReturnValue(true);
      prismaRead.payment.findUnique.mockResolvedValue(null);
      await expect(
        service.confirm('user1', {
          paymentIntentId: 'pi_1',
          externalPaymentId: 'pay_1',
          signature: 'sig_1',
        }),
      ).rejects.toThrow(BadRequestException);
    });

    it('should return early if payment already completed', async () => {
      razorpayService.verifyPaymentSignature.mockReturnValue(true);
      prismaRead.payment.findUnique.mockResolvedValue({
        id: 'p1',
        status: PaymentStatus.COMPLETED,
      } as any);

      const result = await service.confirm('user1', {
        paymentIntentId: 'pi_1',
        externalPaymentId: 'pay_1',
        signature: 'sig_1',
      });

      expect(result.id).toBe('p1');
      expect(prismaWrite.$transaction).not.toHaveBeenCalled();
    });

    it('should update payment and create outbox event', async () => {
      razorpayService.verifyPaymentSignature.mockReturnValue(true);
      prismaRead.payment.findUnique.mockResolvedValue({
        id: 'p1',
        status: PaymentStatus.PENDING,
      } as any);
      prismaWrite.payment.update.mockResolvedValue({
        id: 'p1',
        status: PaymentStatus.COMPLETED,
      } as any);
      outboxService.create.mockResolvedValue({} as any);

      const result = await service.confirm('user1', {
        paymentIntentId: 'pi_1',
        externalPaymentId: 'pay_1',
        signature: 'sig_1',
      });

      expect(prismaWrite.$transaction).toHaveBeenCalled();
      expect(prismaWrite.payment.update).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { id: 'p1' },
          data: expect.objectContaining({ status: PaymentStatus.COMPLETED, externalId: 'pay_1' }),
        }),
      );
      expect(outboxService.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({ eventType: 'PAYMENT_COMPLETED' }),
        }),
      );
      expect(result.id).toBe('p1');
    });
  });
});
