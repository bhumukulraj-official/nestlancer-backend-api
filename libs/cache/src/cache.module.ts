import { Module, DynamicModule, Global } from '@nestjs/common';
import { CacheService } from './cache.service';

@Global()
@Module({})
export class CacheModule {
  static forRoot(options?: { redisUrl?: string }): DynamicModule {
    return {
      module: CacheModule,
      providers: [{ provide: 'CACHE_OPTIONS', useValue: options || {} }, CacheService],
      exports: [CacheService],
    };
  }
}
