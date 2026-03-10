import './integration.env';

import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import { readFileSync, existsSync } from 'fs';
import { resolve } from 'path';
import { AppModule } from '../../src/app.module';
import { EmailWorkerService } from '../../src/services/email-worker.service';
import { EmailConsumer } from '../../src/consumers/email.consumer';
import { QueuePublisherService, QueueConsumerService, DlqService } from '@nestlancer/queue';

function loadDevEnv() {
    const envPath = resolve(__dirname, '../../../../.env.development');
    if (!existsSync(envPath)) return;
    const content = readFileSync(envPath, 'utf8');
    content.split('\n').forEach(line => {
        const trimmed = line.trim();
        if (trimmed && !trimmed.startsWith('#')) {
            const [key, ...value] = trimmed.split('=');
            if (key) {
                process.env[key.trim()] = value.join('=').trim().replace(/^["']|["']$/g, '');
            }
        }
    });
}

describe('Email Worker (Integration)', () => {
    let app: INestApplication;

    jest.setTimeout(30000);

    beforeAll(async () => {
        loadDevEnv();
        process.env.NODE_ENV = 'test';

        const moduleRef: TestingModule = await Test.createTestingModule({
            imports: [AppModule],
        })
            .overrideProvider(QueuePublisherService)
            .useValue({ publish: jest.fn() })
            .overrideProvider(QueueConsumerService)
            .useValue({ consume: jest.fn(), getChannel: jest.fn(), onModuleInit: jest.fn() })
            .overrideProvider(DlqService)
            .useValue({})
            .compile();

        app = moduleRef.createNestApplication();
        await app.init();
    }, 60000);

    afterAll(async () => {
        if (app) {
            await app.close();
        }
    });

    describe('Module Initialization', () => {
        it('should initialize the email worker application context successfully', () => {
            expect(app).toBeDefined();
        });

        it('should resolve AppModule', () => {
            const appModule = app.get(AppModule);
            expect(appModule).toBeDefined();
        });
    });

    describe('Service Resolution', () => {
        it('should resolve EmailWorkerService', () => {
            const service = app.get(EmailWorkerService);
            expect(service).toBeDefined();
        });

        it('should resolve EmailConsumer', () => {
            const consumer = app.get(EmailConsumer);
            expect(consumer).toBeDefined();
        });
    });
});
