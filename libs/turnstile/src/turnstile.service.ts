import { Injectable, Inject, Logger } from '@nestjs/common';
import { TurnstileResult } from './interfaces/turnstile.interface';

@Injectable()
export class TurnstileService {
  private readonly logger = new Logger(TurnstileService.name);

  constructor(@Inject('TURNSTILE_OPTIONS') private readonly options: { secretKey?: string }) {}

  async verify(token: string, remoteIp?: string): Promise<TurnstileResult> {
    const secretKey = this.options.secretKey || process.env.TURNSTILE_SECRET_KEY;
    if (process.env.NODE_ENV === 'test') return { success: true };

    try {
      const response = await fetch('https://challenges.cloudflare.com/turnstile/v0/siteverify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: new URLSearchParams({ secret: secretKey || '', response: token, ...(remoteIp ? { remoteip: remoteIp } : {}) }),
      });
      return await response.json() as TurnstileResult;
    } catch (error) {
      this.logger.error('Turnstile verification failed:', error);
      return { success: false, errorCodes: ['VERIFICATION_FAILED'] };
    }
  }
}
