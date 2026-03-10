import { Module, DynamicModule, Global } from '@nestjs/common';
import { StorageService } from './storage.service';
import { S3Provider } from './providers/s3.provider';
import { LocalProvider } from './providers/local.provider';
import { CloudflareR2Provider } from './providers/cloudflare-r2.provider';
import {
  StorageModuleOptions,
  S3StorageConfig,
  LocalStorageConfig,
} from './interfaces/storage.interface';

@Global()
@Module({})
export class StorageModule {
  static forRoot(options?: Partial<StorageModuleOptions>): DynamicModule {
    const provider =
      options?.provider || (process.env.STORAGE_PROVIDER as 's3' | 'b2' | 'local') || 'local';

    const s3Config: S3StorageConfig = options?.s3 || {
      accessKeyId: process.env.B2_KEY_ID || '',
      secretAccessKey: process.env.B2_APPLICATION_KEY || '',
      endpoint: process.env.B2_ENDPOINT ? `https://${process.env.B2_ENDPOINT}` : undefined,
      region: process.env.B2_REGION || 'us-east-1',
      forcePathStyle: true,
    };

    const localConfig: LocalStorageConfig = options?.local || {
      basePath: process.env.LOCAL_STORAGE_PATH || './data/storage',
      baseUrl: process.env.LOCAL_STORAGE_URL,
    };

    return {
      module: StorageModule,
      providers: [
        { provide: 'STORAGE_OPTIONS', useValue: { ...options, provider } },
        { provide: 'S3_CONFIG', useValue: s3Config },
        { provide: 'LOCAL_STORAGE_CONFIG', useValue: localConfig },
        S3Provider,
        LocalProvider,
        CloudflareR2Provider,
        StorageService,
      ],
      exports: [StorageService],
    };
  }
}
