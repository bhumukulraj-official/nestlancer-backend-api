import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../../src/app.module';

describe('AdminController (e2e)', () => {
    let app: INestApplication;

    beforeAll(async () => {
        const moduleFixture: TestingModule = await Test.createTestingModule({
            imports: [AppModule],
        }).compile();

        app = moduleFixture.createNestApplication();
        await app.init();
    });

    afterAll(async () => {
        await app.close();
    });

    // Note: These endpoints are protected by JwtAuthGuard and SuperAdminGuard.
    // In a real e2e test, we'd mock the guards or provide a valid token in headers.

    it('/system/config (GET) - Unauthorized', () => {
        return request(app.getHttpServer())
            .get('/system/config')
            .expect(401);
    });
});
