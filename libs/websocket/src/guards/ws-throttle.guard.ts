import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';

@Injectable()
export class WsThrottleGuard implements CanActivate {
  private readonly limits = new Map<string, { count: number; resetAt: number }>();

  canActivate(context: ExecutionContext): boolean {
    const client = context.switchToWs().getClient();
    const key = client.id;
    const now = Date.now();
    const record = this.limits.get(key);
    if (!record || now > record.resetAt) { this.limits.set(key, { count: 1, resetAt: now + 60000 }); return true; }
    if (record.count >= 60) return false;
    record.count++;
    return true;
  }
}
