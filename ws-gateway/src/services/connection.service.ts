import { Injectable, Logger } from '@nestjs/common';
import { RedisService } from '@nestlancer/cache';

@Injectable()
export class WsConnectionService {
  private readonly logger = new Logger(WsConnectionService.name);
  private readonly CONNECTIONS_PREFIX = 'ws:connections:';
  private readonly CONNECTIONS_TTL = 86400; // 24 hours

  constructor(private readonly redisService: RedisService) { }

  async addConnection(userId: string, socketId: string): Promise<void> {
    try {
      await this.redisService.sadd(`${this.CONNECTIONS_PREFIX}${userId}`, socketId);
      await this.redisService.expire(`${this.CONNECTIONS_PREFIX}${userId}`, this.CONNECTIONS_TTL);
      this.logger.debug(`Added connection for user ${userId}: ${socketId}`);
    } catch (error) {
      this.logger.error(`Failed to add connection for user ${userId}: ${socketId}`, error);
    }
  }

  async removeConnection(userId: string, socketId: string): Promise<void> {
    try {
      await this.redisService.srem(`${this.CONNECTIONS_PREFIX}${userId}`, socketId);
      this.logger.debug(`Removed connection for user ${userId}: ${socketId}`);
    } catch (error) {
      this.logger.error(`Failed to remove connection for user ${userId}: ${socketId}`, error);
    }
  }

  async isOnline(userId: string): Promise<boolean> {
    try {
      const count = await this.redisService.scard(`${this.CONNECTIONS_PREFIX}${userId}`);
      return count > 0;
    } catch (error) {
      this.logger.error(`Failed to check if user ${userId} is online`, error);
      return false;
    }
  }

  async getUserConnections(userId: string): Promise<string[]> {
    try {
      return await this.redisService.smembers(`${this.CONNECTIONS_PREFIX}${userId}`);
    } catch (error) {
      this.logger.error(`Failed to get connections for user ${userId}`, error);
      return [];
    }
  }
}
