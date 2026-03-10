import {
  WebSocketGateway,
  WebSocketServer,
  OnGatewayConnection,
  OnGatewayDisconnect,
  WsException,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { Logger, UseGuards } from '@nestjs/common';
import { WsAuthGuard } from '@nestlancer/websocket';
import { WsConnectionService } from '../services/connection.service';

@WebSocketGateway({ namespace: '/notifications', cors: { origin: '*' } })
@UseGuards(WsAuthGuard)
export class NotificationGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer() server!: Server;
  private readonly logger = new Logger(NotificationGateway.name);

  constructor(private readonly connectionService: WsConnectionService) {}

  async handleConnection(client: Socket) {
    try {
      const userId = client.data?.user?.userId;
      if (userId) {
        client.join(`user:${userId}`);
        await this.connectionService.addConnection(userId, client.id);
        this.server
          .to(`user:${userId}`)
          .emit('presence:online', { userId, onlineAt: new Date().toISOString() });
      }
      this.logger.log(`Notification client connected: ${client.id}`);
    } catch (error: any) {
      this.logger.error(`Error handling notification connection: ${client.id}`, error);
    }
  }

  async handleDisconnect(client: Socket) {
    try {
      const userId = client.data?.user?.userId;
      if (userId) {
        this.server
          .to(`user:${userId}`)
          .emit('presence:offline', { userId, offlineAt: new Date().toISOString() });
        await this.connectionService.removeConnection(userId, client.id);
      }
      this.logger.log(`Notification client disconnected: ${client.id}`);
    } catch (error: any) {
      this.logger.error(`Error handling notification disconnection: ${client.id}`, error);
    }
  }

  /** Send notification to specific user via WebSocket */
  sendToUser(userId: string, notification: Record<string, unknown>): void {
    try {
      if (!userId) throw new WsException('Missing userId');
      this.server.to(`user:${userId}`).emit('notification:new', notification);
      this.logger.debug(`Notification sent to user ${userId}`);
    } catch (error: any) {
      this.logger.error(`Failed to send notification to user ${userId}`, error);
    }
  }

  /** Emit an event to a user's room (used by Redis subscriber for fan-out) */
  emitToUser(userId: string, event: string, data: unknown): void {
    try {
      if (!userId || !event) return;
      const wsEvent = event === 'notification.new' ? 'notification:new' : event;
      this.server.to(`user:${userId}`).emit(wsEvent, data);
      this.logger.debug(`Emitted ${wsEvent} to user ${userId}`);
    } catch (error: any) {
      this.logger.error(`Failed to emit to user ${userId}`, error);
    }
  }

  /** Broadcast to all connected clients */
  broadcast(event: string, data: unknown): void {
    try {
      if (!event) throw new WsException('Missing event name');
      this.server.emit(event, data);
      this.logger.debug(`Broadcast event ${event} sent`);
    } catch (error: any) {
      this.logger.error(`Failed to broadcast event ${event}`, error);
    }
  }
}
