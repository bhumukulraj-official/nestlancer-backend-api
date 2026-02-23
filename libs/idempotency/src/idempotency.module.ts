import { Module, DynamicModule, Global } from '@nestjs/common';
import { IdempotencyGuard } from './idempotency.guard';
import { IdempotencyInterceptor } from './idempotency.interceptor';

@Global()
@Module({})
export class IdempotencyModule {
  static forRoot(): DynamicModule {
    return {
      module: IdempotencyModule,
      providers: [IdempotencyGuard, IdempotencyInterceptor],
      exports: [IdempotencyGuard, IdempotencyInterceptor],
    };
  }
}
