import { WebSocketGateway, WebSocketServer, OnGatewayConnection, OnGatewayDisconnect, WsException } from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { Logger, UseGuards } from '@nestjs/common';
import { WsAuthGuard } from '@nestlancer/websocket';
import { WsConnectionService } from '../services/connection.service';

@WebSocketGateway({ namespace: '/notifications', cors: { origin: '*' } })
@UseGuards(WsAuthGuard)
export class NotificationGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer() server!: Server;
  private readonly logger = new Logger(NotificationGateway.name);

  constructor(private readonly connectionService: WsConnectionService) { }

  async handleConnection(client: Socket) {
    try {
      const userId = client.data?.user?.userId;
      if (userId) {
        client.join(`user:${userId}`);
        await this.connectionService.addConnection(userId, client.id);
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
