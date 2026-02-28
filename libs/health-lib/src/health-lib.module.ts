import { Module, Global } from '@nestjs/common';
import { DatabaseHealthIndicator } from './indicators/database.indicator';
import { RedisHealthIndicator } from './indicators/redis.indicator';
import { RabbitmqHealthIndicator } from './indicators/rabbitmq.indicator';
import { StorageHealthIndicator } from './indicators/storage.indicator';
import { MemoryHealthIndicator } from './indicators/memory.indicator';
import { DiskHealthIndicator } from './indicators/disk.indicator';

@Global()
@Module({
  providers: [DatabaseHealthIndicator, RedisHealthIndicator, RabbitmqHealthIndicator, StorageHealthIndicator, MemoryHealthIndicator, DiskHealthIndicator],
  exports: [DatabaseHealthIndicator, RedisHealthIndicator, RabbitmqHealthIndicator, StorageHealthIndicator, MemoryHealthIndicator, DiskHealthIndicator],
})
export class HealthLibModule { }
