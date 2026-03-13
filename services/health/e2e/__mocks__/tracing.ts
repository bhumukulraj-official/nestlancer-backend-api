import { Module, DynamicModule } from '@nestjs/common';

@Module({})
export class TracingModule {
  static forRoot(): DynamicModule {
    // Return a minimal no-op module for E2E tests
    return {
      module: TracingModule,
      global: false,
      providers: [],
      exports: [],
    };
  }
}

