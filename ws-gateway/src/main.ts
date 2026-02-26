import { NestFactory } from '@nestjs/core';
import { WsAppModule } from './app.module';
import { CustomRedisIoAdapter } from './adapters/redis-io.adapter';
import { Logger } from '@nestjs/common';
import { NestlancerConfigService } from '@nestlancer/config';

async function bootstrap() {
  const logger = new Logger('WsGatewayBootstrap');
  const app = await NestFactory.create(WsAppModule, { bufferLogs: true });

  // Setup graceful shutdown
  app.enableShutdownHooks();

  const redisIoAdapter = new CustomRedisIoAdapter(app);
  await redisIoAdapter.connectToRedis();
  app.useWebSocketAdapter(redisIoAdapter);

  const configService = app.get(NestlancerConfigService);
  const port = configService.port || process.env.WS_PORT || 3100;

  await app.listen(port);
  logger.log(`🔌 Nestlancer WebSocket Gateway running on wss://localhost:${port}`);
}

bootstrap();
