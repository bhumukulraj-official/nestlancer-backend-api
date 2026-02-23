import { Injectable, Logger } from '@nestjs/common';

@Injectable()
export class WsPresenceService {
  private readonly logger = new Logger(WsPresenceService.name);

  async setOnline(userId: string): Promise<void> {
    // In production: store presence in Redis for multi-instance support
    this.logger.debug(`User ${userId} is online`);
  }

  async setOffline(userId: string): Promise<void> {
    this.logger.debug(`User ${userId} is offline`);
  }

  async getOnlineUsers(): Promise<string[]> {
    return [];
  }
}
