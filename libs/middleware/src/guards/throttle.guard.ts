import {
  Injectable,
  CanActivate,
  ExecutionContext,
  HttpException,
  HttpStatus,
} from '@nestjs/common';

@Injectable()
export class ThrottleGuard implements CanActivate {
  private readonly windowMs = 60000;
  private readonly max = 100;
  private readonly requests = new Map<string, { count: number; resetAt: number }>();

  canActivate(context: ExecutionContext): boolean {
    const req = context.switchToHttp().getRequest();
    const key = req.user?.userId || req.ip;
    const now = Date.now();
    const record = this.requests.get(key);

    if (!record || now > record.resetAt) {
      this.requests.set(key, { count: 1, resetAt: now + this.windowMs });
      return true;
    }

    if (record.count >= this.max) {
      const retryAfter = Math.ceil((record.resetAt - now) / 1000);
      throw new HttpException(
        {
          code: 'RATE_LIMIT_EXCEEDED',
          message: `Rate limit exceeded. Retry after ${retryAfter}s`,
          retryAfter,
        },
        HttpStatus.TOO_MANY_REQUESTS,
      );
    }

    record.count++;
    return true;
  }
}
