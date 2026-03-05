import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PrismaReadService, PrismaWriteService } from '@nestlancer/database';
import { PdfService } from '@nestlancer/pdf';
import { StorageService } from '@nestlancer/storage';
import { OutboxService, OutboxPollerService } from '@nestlancer/outbox';
import { QueuePublisherService, QueueConsumerService } from '@nestlancer/queue';
import { CacheService } from '@nestlancer/cache';
import { AppModule } from '../../src/app.module';
import { RazorpayService, PaymentConfirmationService, ReceiptPdfService, InvoicePdfService } from '../../src/services';

describe('AppModule (Integration)', () => {
    let app: INestApplication;

    beforeAll(async () => {
        process.env.DATABASE_URL = 'postgresql://postgres:postgres@localhost:5432/nestlancer_payments_test';
        process.env.JWT_ACCESS_SECRET = 'test-secret';
        process.env.JWT_REFRESH_SECRET = 'test-secret';
        process.env.RAZORPAY_KEY_ID = 'rzp_test_123';
        process.env.RAZORPAY_KEY_SECRET = 'secret_test_123';
        process.env.RAZORPAY_WEBHOOK_SECRET = 'webhook_secret_123';
        process.env.REDIS_HOST = 'localhost';
        process.env.REDIS_PORT = '6379';
        process.env.RABBITMQ_URL = 'amqp://localhost:5672';
        process.env.AWS_REGION = 'us-east-1';
        process.env.AWS_ACCESS_KEY_ID = 'test';
        process.env.AWS_SECRET_ACCESS_KEY = 'test';
        process.env.AWS_S3_BUCKET = 'test-bucket';

        const moduleRef: TestingModule = await Test.createTestingModule({
            imports: [AppModule],
        })
            .overrideProvider(ConfigService).useValue({ get: jest.fn() })
            .overrideProvider(PrismaWriteService).useValue({})
            .overrideProvider(PrismaReadService).useValue({ payment: { count: jest.fn(), findMany: jest.fn(), findFirst: jest.fn(), } })
            .overrideProvider(PdfService).useValue({})
            .overrideProvider(StorageService).useValue({})
            .overrideProvider(OutboxService).useValue({})
            .overrideProvider(QueuePublisherService).useValue({})
            .overrideProvider(CacheService).useValue({})
            .overrideProvider(ReceiptPdfService).useValue({})
            .overrideProvider(InvoicePdfService).useValue({})
            .overrideProvider(PaymentConfirmationService).useValue({})
            .overrideProvider(RazorpayService).useValue({})
            .overrideProvider(QueueConsumerService).useValue({ startListening: jest.fn(), onModuleDestroy: jest.fn() })
            .overrideProvider(OutboxPollerService).useValue({ startPolling: jest.fn(), stopPolling: jest.fn() })
            .compile();

        app = moduleRef.createNestApplication();
        await app.init();
    });

    afterAll(async () => {
        if (app) {
            await app.close();
        }
    });

    it('should initialize the HTTP service application successfully', () => {
        expect(app).toBeDefined();
    });

    it('should resolve AppModule dependencies', () => {
        const appModule = app.get(AppModule);
        expect(appModule).toBeDefined();
    });
});
