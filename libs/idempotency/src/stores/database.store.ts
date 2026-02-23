import { Injectable } from '@nestjs/common';

@Injectable()
export class DatabaseIdempotencyStore {
  async get(key: string): Promise<{ responseCode: number; responseBody: unknown } | null> { void key; return null; }
  async set(key: string, response: { responseCode: number; responseBody: unknown }): Promise<void> { void key; void response; }
}
