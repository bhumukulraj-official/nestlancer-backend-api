import { Injectable, OnModuleInit, OnModuleDestroy, Logger } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';

/** Read replica Prisma client (ADR-005). Falls back to primary if no read URL configured. */
@Injectable()
export class PrismaReadService extends PrismaClient implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(PrismaReadService.name);

  constructor() {
    super({
      datasourceUrl: process.env.DATABASE_READ_URL || process.env.DATABASE_URL,
      log: process.env.NODE_ENV === 'development' ? ['query', 'warn', 'error'] : ['error'],
    });
  }

  async onModuleInit(): Promise<void> {
    this.logger.log('Connecting to read replica...');
    await this.$connect();
    this.logger.log('Connected to read replica');
  }

  async onModuleDestroy(): Promise<void> {
    await this.$disconnect();
  }
}
