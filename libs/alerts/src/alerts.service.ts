import { Injectable, Logger } from '@nestjs/common';
import { AlertPayload } from './interfaces/alert.interface';

@Injectable()
export class AlertsService {
  private readonly logger = new Logger(AlertsService.name);

  async sendAlert(alert: AlertPayload): Promise<void> {
    this.logger.warn(`ALERT [${alert.severity}]: ${alert.title} - ${alert.message}`);
    // Route to appropriate channels based on severity
  }
}
