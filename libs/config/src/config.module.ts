import { Module, DynamicModule, Global } from '@nestjs/common';
import { ConfigModule as NestConfigModule } from '@nestjs/config';
import { NestlancerConfigService } from './config.service';
import { appConfigSchema } from './schemas';
import { loadEnvConfig } from './loaders/env.loader';

@Global()
@Module({})
export class ConfigModule {
  static forRoot(): DynamicModule {
    return {
      module: ConfigModule,
      imports: [
        NestConfigModule.forRoot({
          isGlobal: true,
          load: [loadEnvConfig],
          validate: (config) => appConfigSchema.parse(config),
          expandVariables: true,
        }),
      ],
      providers: [NestlancerConfigService],
      exports: [NestlancerConfigService],
    };
  }
}
