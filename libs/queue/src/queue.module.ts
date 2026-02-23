import { Module, DynamicModule, Global } from '@nestjs/common';
import { QueuePublisherService } from './queue-publisher.service';
import { QueueConsumerService } from './queue-consumer.service';
import { DlqService } from './dlq.service';

@Global()
@Module({})
export class QueueModule {
  static forRoot(options?: { url?: string }): DynamicModule {
    return {
      module: QueueModule,
      providers: [
        { provide: 'QUEUE_OPTIONS', useValue: options || {} },
        QueuePublisherService, QueueConsumerService, DlqService,
      ],
      exports: [QueuePublisherService, QueueConsumerService, DlqService],
    };
  }
}
