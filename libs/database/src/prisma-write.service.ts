import { Injectable, OnModuleInit, OnModuleDestroy, Logger } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';

/** Primary Prisma client for write operations (ADR-005) */
@Injectable()
export class PrismaWriteService extends PrismaClient implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(PrismaWriteService.name);

  constructor() {
    super({
      datasources: { db: { url: process.env.DATABASE_URL } },
      log: process.env.NODE_ENV === 'development' ? ['query', 'info', 'warn', 'error'] : ['error'],
    } as any);
  }

  async onModuleInit(): Promise<void> {
    this.logger.log('Connecting to primary database...');
    await this.$connect();
    this.logger.log('Connected to primary database');
  }

  async onModuleDestroy(): Promise<void> {
    await this.$disconnect();
    this.logger.log('Disconnected from primary database');
  }
}
