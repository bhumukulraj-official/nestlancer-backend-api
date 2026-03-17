import { Module, DynamicModule, Global } from '@nestjs/common';
import { NestlancerConfigService } from '@nestlancer/config';
import { StorageService } from './storage.service';
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
    return {
      module: StorageModule,
      providers: [
        {
          provide: 'STORAGE_OPTIONS',
          inject: [NestlancerConfigService],
          useFactory: (config: NestlancerConfigService): StorageModuleOptions => {
            const provider =
              options?.provider ||
              (config.storageProvider as 'b2' | 'local') ||
              'local';

            const s3Config: S3StorageConfig = options?.s3 || {
              accessKeyId: config.b2KeyId,
              secretAccessKey: config.b2ApplicationKey,
              endpoint: config.b2Endpoint ? `https://${config.b2Endpoint}` : undefined,
              region: config.b2Region,
              forcePathStyle: true,
            };

            const localConfig: LocalStorageConfig = options?.local || {
              basePath: config.localStoragePath,
              baseUrl: config.localStorageUrl,
            };

            return { ...(options || {}), provider, s3: s3Config, local: localConfig };
          },
        },
        {
          provide: 'S3_CONFIG',
          inject: ['STORAGE_OPTIONS'],
          useFactory: (opts: StorageModuleOptions): S3StorageConfig => opts.s3,
        },
        {
          provide: 'LOCAL_STORAGE_CONFIG',
          inject: ['STORAGE_OPTIONS'],
          useFactory: (opts: StorageModuleOptions): LocalStorageConfig => opts.local,
        },
        LocalProvider,
        CloudflareR2Provider,
        StorageService,
      ],
      exports: [StorageService],
    };
  }
}
