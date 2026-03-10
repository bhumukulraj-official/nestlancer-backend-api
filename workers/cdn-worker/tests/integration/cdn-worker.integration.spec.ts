import './integration.env';

import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import { readFileSync, existsSync } from 'fs';
import { resolve } from 'path';
import { AppModule } from '../../src/app.module';
import { CdnWorkerService } from '../../src/services/cdn-worker.service';
import { CdnConsumer } from '../../src/consumers/cdn.consumer';
import { PathInvalidationProcessor } from '../../src/processors/path-invalidation.processor';
import { BatchInvalidationProcessor } from '../../src/processors/batch-invalidation.processor';
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

describe('CDN Worker (Integration)', () => {
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
        it('should initialize the cdn worker application context successfully', () => {
            expect(app).toBeDefined();
        });

        it('should resolve AppModule', () => {
            const appModule = app.get(AppModule);
            expect(appModule).toBeDefined();
        });
    });

    describe('Service Resolution', () => {
        it('should resolve CdnWorkerService', () => {
            const service = app.get(CdnWorkerService);
            expect(service).toBeDefined();
        });

        it('should resolve CdnConsumer', () => {
            const consumer = app.get(CdnConsumer);
            expect(consumer).toBeDefined();
        });

        it('should resolve PathInvalidationProcessor', () => {
            const processor = app.get(PathInvalidationProcessor);
            expect(processor).toBeDefined();
        });

        it('should resolve BatchInvalidationProcessor', () => {
            const processor = app.get(BatchInvalidationProcessor);
            expect(processor).toBeDefined();
        });
    });
});
