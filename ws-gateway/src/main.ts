import { NestFactory } from '@nestjs/core';
import { WsAppModule } from './app.module';
import { CustomRedisIoAdapter } from './adapters/redis-io.adapter';
import { Logger } from '@nestjs/common';
import { WsExceptionFilter } from './filters/ws-exception.filter';

async function bootstrap() {
  const logger = new Logger('WsGatewayBootstrap');
  const app = await NestFactory.create(WsAppModule, { bufferLogs: true });

  app.useGlobalFilters(new WsExceptionFilter());

  app.enableShutdownHooks();

  const redisIoAdapter = new CustomRedisIoAdapter(app);
  await redisIoAdapter.connectToRedis();
  app.useWebSocketAdapter(redisIoAdapter);

  const port = Number(process.env.WS_PORT || 3100);

  await app.listen(port);
  logger.log(`🔌 Nestlancer WebSocket Gateway running on wss://localhost:${port}`);
}

bootstrap();
