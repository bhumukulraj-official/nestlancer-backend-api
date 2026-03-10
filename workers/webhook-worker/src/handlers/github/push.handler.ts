import { Injectable } from '@nestjs/common';
import { WebhookHandler } from '../../interfaces/webhook-handler.interface';
import { LoggerService } from '@nestlancer/logger';

@Injectable()
export class GithubPushHandler implements WebhookHandler {
  constructor(private readonly logger: LoggerService) {}

  canHandle(provider: string, eventType: string): boolean {
    return provider === 'github' && eventType === 'push';
  }

  async handle(payload: any): Promise<void> {
    this.logger.log(`Received GitHub push event for repo: ${payload.repository.full_name}`);
    // Logic for deployment tracking etc.
  }
}
