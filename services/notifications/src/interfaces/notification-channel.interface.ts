import { NotificationChannel } from './notification.interface';

export interface DeliveryResult {
  channel: NotificationChannel;
  success: boolean;
  messageId?: string;
  error?: string;
}

export interface INotificationChannel {
  send(userId: string, notification: any): Promise<DeliveryResult>;
}
