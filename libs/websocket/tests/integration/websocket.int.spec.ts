import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import { IoAdapter } from '@nestjs/platform-socket.io';
import { RedisIoAdapter } from '../../src/adapters/redis.adapter';
import { WebSocketLibModule } from '../../src/websocket-lib.module';

describe('Websocket Integration', () => {
    let app: INestApplication;

    beforeAll(async () => {
        const moduleFixture: TestingModule = await Test.createTestingModule({
            imports: [WebSocketLibModule],
        }).compile();

        app = moduleFixture.createNestApplication();
        app.useWebSocketAdapter(new RedisIoAdapter(app));
        await app.init();
    });

    afterAll(async () => {
        await app.close();
    });

    it('should configure websocket with redis adapter', () => {
        // Just verify it doesn't crash on init with the custom adapter bound
        expect(app).toBeDefined();
    });
});
