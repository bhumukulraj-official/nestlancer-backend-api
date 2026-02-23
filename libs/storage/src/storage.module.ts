import { Module, DynamicModule, Global } from '@nestjs/common';
import { StorageService } from './storage.service';

@Global()
@Module({})
export class StorageModule {
  static forRoot(options?: { provider?: string }): DynamicModule {
    return { module: StorageModule, providers: [{ provide: 'STORAGE_OPTIONS', useValue: options || {} }, StorageService], exports: [StorageService] };
  }
}
