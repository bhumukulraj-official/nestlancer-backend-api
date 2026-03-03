import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { LoggerService } from '@nestlancer/logger';
import { BusinessLogicException } from '@nestlancer/common';

@Injectable()
export class TurnstileService {
    private readonly secretKey: string;
    private readonly bypassToken: string;
    private readonly verifyUrl = 'https://challenges.cloudflare.com/turnstile/v0/siteverify';

    constructor(
        private readonly configService: ConfigService,
        private readonly logger: LoggerService,
    ) {
        this.secretKey = this.configService.get<string>('authService.turnstile.secretKey') ?? '';
        this.bypassToken = this.configService.get<string>('authService.turnstile.bypassToken') ?? '';
    }

    async verifyToken(token: string, ipAddress?: string): Promise<boolean> {
        if (!token) return false;

        // For local dev/e2e testing
        if (this.bypassToken && token === this.bypassToken) {
            return true;
        }

        if (process.env.NODE_ENV === 'test') {
            return true;
        }

        if (!this.secretKey) {
            this.logger.warn('Turnstile secret key missing, bypassing verification...', 'TurnstileService');
            return true;
        }

        try {
            const formData = new URLSearchParams();
            formData.append('secret', this.secretKey);
            formData.append('response', token);
            if (ipAddress) {
                formData.append('remoteip', ipAddress);
            }

            // Simplified fetch rather than bringing in full HttpService / Axios for one call
            const response = await fetch(this.verifyUrl, {
                method: 'POST',
                body: formData as any,
            });

            const data = await response.json() as { success: boolean; 'error-codes'?: string[] };

            if (!data.success) {
                this.logger.warn(`Turnstile verification failed: ${JSON.stringify(data['error-codes'])}`, 'TurnstileService');
                throw new BusinessLogicException('Turnstile verification failed', 'AUTH_011');
            }

            return true;
        } catch (error: any) {
            if (error instanceof BusinessLogicException) throw error;

            this.logger.error('Error verifying turnstile token', error.stack, 'TurnstileService');
            throw new BusinessLogicException('Turnstile verification failed', 'AUTH_011');
        }
    }
}
