import { Injectable } from '@nestjs/common';

@Injectable()
export class RedisIdempotencyStore {
  async get(key: string): Promise<{ responseCode: number; responseBody: unknown } | null> { void key; return null; }
  async set(key: string, response: { responseCode: number; responseBody: unknown }, ttlSeconds: number): Promise<void> { void key; void response; void ttlSeconds; }
  async lock(key: string): Promise<boolean> { void key; return true; }
  async unlock(key: string): Promise<void> { void key; }
}
