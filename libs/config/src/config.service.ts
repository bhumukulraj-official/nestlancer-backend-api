import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class NestlancerConfigService {
  constructor(private readonly configService: ConfigService) {}

  get<T = string>(key: string): T {
    return this.configService.getOrThrow<T>(key);
  }

  getOptional<T = string>(key: string, defaultValue?: T): T | undefined {
    return this.configService.get<T>(key) ?? defaultValue;
  }

  get nodeEnv(): string { return this.get('NODE_ENV'); }
  get isProduction(): boolean { return this.nodeEnv === 'production'; }
  get isDevelopment(): boolean { return this.nodeEnv === 'development'; }
  get isTest(): boolean { return this.nodeEnv === 'test'; }

  get databaseUrl(): string { return this.get('DATABASE_URL'); }
  get databaseReadUrl(): string { return this.getOptional('DATABASE_READ_URL') ?? this.databaseUrl; }
  get redisUrl(): string { return this.get('REDIS_URL'); }
  get redisPubSubUrl(): string { return this.getOptional('REDIS_PUBSUB_URL') ?? this.redisUrl; }
  get rabbitmqUrl(): string { return this.get('RABBITMQ_URL'); }
  get jwtAccessSecret(): string { return this.get('JWT_ACCESS_SECRET'); }
  get jwtRefreshSecret(): string { return this.get('JWT_REFRESH_SECRET'); }
  get encryptionKey(): string { return this.get('ENCRYPTION_KEY'); }
  get corsOrigins(): string[] { return this.get<string>('CORS_ORIGINS').split(',').map(s => s.trim()); }
}
