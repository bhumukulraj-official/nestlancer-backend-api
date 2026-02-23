import { Module, Global } from '@nestjs/common';
import { DatabaseHealthIndicator } from './indicators/database.indicator';
import { RedisHealthIndicator } from './indicators/redis.indicator';
import { RabbitMQHealthIndicator } from './indicators/rabbitmq.indicator';
import { StorageHealthIndicator } from './indicators/storage.indicator';
import { MemoryHealthIndicator } from './indicators/memory.indicator';
import { DiskHealthIndicator } from './indicators/disk.indicator';

@Global()
@Module({
  providers: [DatabaseHealthIndicator, RedisHealthIndicator, RabbitMQHealthIndicator, StorageHealthIndicator, MemoryHealthIndicator, DiskHealthIndicator],
  exports: [DatabaseHealthIndicator, RedisHealthIndicator, RabbitMQHealthIndicator, StorageHealthIndicator, MemoryHealthIndicator, DiskHealthIndicator],
})
export class HealthLibModule {}
