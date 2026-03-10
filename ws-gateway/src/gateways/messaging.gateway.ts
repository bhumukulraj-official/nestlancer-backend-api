import {
  WebSocketGateway,
  SubscribeMessage,
  MessageBody,
  ConnectedSocket,
  WebSocketServer,
  OnGatewayConnection,
  OnGatewayDisconnect,
  WsException,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { Logger, UseGuards } from '@nestjs/common';
import { WsAuthGuard } from '@nestlancer/websocket';
import { WsConnectionService } from '../services/connection.service';
import { WsPresenceService } from '../services/presence.service';

@WebSocketGateway({ namespace: '/messages', cors: { origin: '*' } })
@UseGuards(WsAuthGuard)
export class MessagingGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer() server!: Server;
  private readonly logger = new Logger(MessagingGateway.name);

  constructor(
    private readonly connectionService: WsConnectionService,
    private readonly presenceService: WsPresenceService,
  ) {}

  async handleConnection(client: Socket) {
    try {
      const userId = client.data?.user?.userId;
      if (userId) {
        await this.connectionService.addConnection(userId, client.id);
        await this.presenceService.setOnline(userId);
      }
      this.logger.log(`Messaging client connected: ${client.id}`);
    } catch (error: any) {
      this.logger.error(`Error handling connection for client ${client.id}`, error);
    }
  }

  async handleDisconnect(client: Socket) {
    try {
      const userId = client.data?.user?.userId;
      if (userId) {
        await this.connectionService.removeConnection(userId, client.id);
        const connections = await this.connectionService.getUserConnections(userId);
        if (connections.length === 0) {
          await this.presenceService.setOffline(userId);
        }
      }
      this.logger.log(`Messaging client disconnected: ${client.id}`);
    } catch (error: any) {
      this.logger.error(`Error handling disconnection for client ${client.id}`, error);
    }
  }

  @SubscribeMessage('join:room')
  handleJoinRoom(@MessageBody() data: { projectId: string }, @ConnectedSocket() client: Socket) {
    try {
      if (!data?.projectId) throw new WsException('Missing projectId');
      client.join(`chat:${data.projectId}`);
      this.logger.debug(`User ${client.data?.user?.userId} joined chat room: ${data.projectId}`);
      return { event: 'joined', data };
    } catch (error: any) {
      this.logger.error(`Error joining room`, error);
      throw new WsException('Internal server error');
    }
  }

  @SubscribeMessage('message:send')
  handleMessage(
    @MessageBody() data: { projectId: string; content: string; type?: string },
    @ConnectedSocket() client: Socket,
  ) {
    try {
      if (!data?.projectId || !data?.content) throw new WsException('Invalid message payload');
      const senderId = client.data?.user?.userId;
      const message = { ...data, senderId, createdAt: new Date().toISOString() };

      // Emit back to room immediately for real-time responsiveness
      this.server.to(`chat:${data.projectId}`).emit('message:new', message);
      this.logger.debug(`Message sent in room ${data.projectId} by user ${senderId}`);

      return { event: 'message:sent', data: message };
    } catch (error: any) {
      this.logger.error(`Error handling message send`, error);
      throw new WsException('Internal server error');
    }
  }

  @SubscribeMessage('typing:start')
  handleTypingStart(@MessageBody() data: { projectId: string }, @ConnectedSocket() client: Socket) {
    try {
      if (!data?.projectId) throw new WsException('Missing projectId');
      const userId = client.data?.user?.userId;
      client.to(`chat:${data.projectId}`).emit('typing:indicator', { userId, isTyping: true });
    } catch (error: any) {
      this.logger.error(`Error handling typing start`, error);
    }
  }

  @SubscribeMessage('typing:stop')
  handleTypingStop(@MessageBody() data: { projectId: string }, @ConnectedSocket() client: Socket) {
    try {
      if (!data?.projectId) throw new WsException('Missing projectId');
      const userId = client.data?.user?.userId;
      client.to(`chat:${data.projectId}`).emit('typing:indicator', { userId, isTyping: false });
    } catch (error: any) {
      this.logger.error(`Error handling typing stop`, error);
    }
  }
}
