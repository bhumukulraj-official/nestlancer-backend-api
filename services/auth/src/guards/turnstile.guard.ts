import { Injectable, CanActivate, ExecutionContext } from '@nestjs/common';
import { TurnstileService } from '../services/turnstile.service';
import { BusinessLogicException } from '@nestlancer/common/exceptions/business-logic.exception';

@Injectable()
export class TurnstileGuard implements CanActivate {
    constructor(private turnstileService: TurnstileService) { }

    async canActivate(context: ExecutionContext): Promise<boolean> {
        const request = context.switchToHttp().getRequest();
        const token = request.body?.turnstileToken || request.query?.turnstileToken || request.headers['x-turnstile-token'];

        if (!token) {
            throw new BusinessLogicException('Turnstile token required', 'AUTH_011');
        }

        const ipAddress = request.ip || request.headers['x-forwarded-for'];
        await this.turnstileService.verifyToken(token, ipAddress);

        return true;
    }
}
