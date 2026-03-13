import { DynamicModule, Injectable, Module } from '@nestjs/common';

@Injectable()
export class QueuePublisherService {
  // No-op implementations to avoid real RabbitMQ connections in E2E
  async onModuleInit(): Promise<void> {
    return;
  }

  async onModuleDestroy(): Promise<void> {
    return;
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  async publish(exchange: string, routingKey: string, payload: unknown): Promise<void> {
    return;
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  async sendToQueue(queue: string, payload: unknown): Promise<void> {
    return;
  }
}

@Module({})
export class QueueModule {
  static forRoot(): DynamicModule {
    return {
      module: QueueModule,
      providers: [QueuePublisherService],
      exports: [QueuePublisherService],
    };
  }
}

