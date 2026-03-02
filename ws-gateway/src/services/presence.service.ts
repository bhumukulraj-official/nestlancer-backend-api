import { Injectable, Logger } from '@nestjs/common';
import { RedisService } from '@nestlancer/cache';

@Injectable()
export class WsPresenceService {
  private readonly logger = new Logger(WsPresenceService.name);
  private readonly PRESENCE_PREFIX = 'ws:presence:';
  private readonly PRESENCE_TTL = 300; // 5 minutes

  constructor(private readonly redisService: RedisService) { }

  async setOnline(userId: string): Promise<void> {
    try {
      await this.redisService.set(`${this.PRESENCE_PREFIX}${userId}`, 'online', this.PRESENCE_TTL);
      this.logger.debug(`User ${userId} is marked online in Redis`);
    } catch (error: any) {
      this.logger.error(`Failed to set user ${userId} online`, error);
    }
  }

  async setOffline(userId: string): Promise<void> {
    try {
      await this.redisService.del(`${this.PRESENCE_PREFIX}${userId}`);
      this.logger.debug(`User ${userId} is marked offline in Redis`);
    } catch (error: any) {
      this.logger.error(`Failed to set user ${userId} offline`, error);
    }
  }

  async getOnlineUsers(): Promise<string[]> {
    try {
      const keys = await this.redisService.keys(`${this.PRESENCE_PREFIX}*`);
      return keys.map((key) => key.replace(this.PRESENCE_PREFIX, ''));
    } catch (error: any) {
      this.logger.error('Failed to get online users', error);
      return [];
    }
  }

  async isOnline(userId: string): Promise<boolean> {
    try {
      const status = await this.redisService.get(`${this.PRESENCE_PREFIX}${userId}`);
      return status === 'online';
    } catch (error: any) {
      this.logger.error(`Failed to check if user ${userId} is online`, error);
      return false;
    }
  }
}
