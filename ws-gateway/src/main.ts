import { NestFactory } from '@nestjs/core';
import { WsAppModule } from './app.module';
import { RedisIoAdapter } from '@nestlancer/websocket';

async function bootstrap() {
  const app = await NestFactory.create(WsAppModule);
  app.useWebSocketAdapter(new RedisIoAdapter(app));

  const port = process.env.WS_PORT || 3100;
  await app.listen(port);
  console.log(`🔌 Nestlancer WebSocket Gateway running on ws://localhost:${port}`);
}

bootstrap();
