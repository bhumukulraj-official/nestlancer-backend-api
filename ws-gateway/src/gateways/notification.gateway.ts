import { WebSocketGateway, WebSocketServer, OnGatewayConnection, OnGatewayDisconnect } from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { Logger, UseGuards } from '@nestjs/common';
import { WsAuthGuard } from '@nestlancer/websocket';

@WebSocketGateway({ namespace: '/notifications', cors: { origin: '*' } })
@UseGuards(WsAuthGuard)
export class NotificationGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer() server!: Server;
  private readonly logger = new Logger(NotificationGateway.name);

  handleConnection(client: Socket) {
    const userId = client.data?.user?.userId;
    if (userId) { client.join(`user:${userId}`); }
    this.logger.log(`Notification client connected: ${client.id}`);
  }

  handleDisconnect(client: Socket) {
    this.logger.log(`Notification client disconnected: ${client.id}`);
  }

  /** Send notification to specific user via WebSocket */
  sendToUser(userId: string, notification: Record<string, unknown>): void {
    this.server.to(`user:${userId}`).emit('notification:new', notification);
  }

  /** Broadcast to all connected clients */
  broadcast(event: string, data: unknown): void {
    this.server.emit(event, data);
  }
}
