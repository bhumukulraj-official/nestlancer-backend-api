import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../../src/app.module';

describe('WebhooksService (e2e)', () => {
    let app: INestApplication;

    beforeAll(async () => {
        const moduleFixture: TestingModule = await Test.createTestingModule({
            imports: [AppModule],
        })
            .overrideProvider('PrismaWriteService')
            .useValue({
                webhookLog: {
                    create: jest.fn().mockResolvedValue({ id: '123' }),
                    update: jest.fn().mockResolvedValue({}),
                    findFirst: jest.fn().mockResolvedValue(null),
                }
            })
            .overrideProvider('QueueConsumerService')
            .useValue({
                publishMessage: jest.fn().mockResolvedValue(true)
            })
            .compile();

        app = moduleFixture.createNestApplication();
        await app.init();
    });

    afterAll(async () => {
        await app.close();
    });

    it('/razorpay (POST) without auth should fail', () => {
        return request(app.getHttpServer())
            .post('/razorpay')
            .send({ event: 'payment.captured' })
            .expect(401);
    });
});
