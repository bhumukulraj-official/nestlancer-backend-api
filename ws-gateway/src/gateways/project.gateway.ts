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

@WebSocketGateway({ namespace: '/projects', cors: { origin: '*' } })
@UseGuards(WsAuthGuard)
export class ProjectGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer() server!: Server;
  private readonly logger = new Logger(ProjectGateway.name);

  constructor(private readonly connectionService: WsConnectionService) {}

  async handleConnection(client: Socket) {
    try {
      const userId = client.data?.user?.userId;
      if (userId) {
        await this.connectionService.addConnection(userId, client.id);
      }
      this.logger.log(`Client connected: ${client.id}`);
    } catch (error: any) {
      this.logger.error(`Error handling connection for client ${client.id}`, error);
    }
  }

  async handleDisconnect(client: Socket) {
    try {
      const userId = client.data?.user?.userId;
      if (userId) {
        await this.connectionService.removeConnection(userId, client.id);
      }
      this.logger.log(`Client disconnected: ${client.id}`);
    } catch (error: any) {
      this.logger.error(`Error handling disconnection for client ${client.id}`, error);
    }
  }

  @SubscribeMessage('subscribe:project')
  handleSubscribe(@MessageBody() data: { projectId: string }, @ConnectedSocket() client: Socket) {
    try {
      if (!data?.projectId) throw new WsException('Missing projectId');
      client.join(`project:${data.projectId}`);
      this.logger.debug(`Client ${client.id} joined project room: ${data.projectId}`);
      return { event: 'subscribed', data: { projectId: data.projectId } };
    } catch (error: any) {
      this.logger.error(`Error subscribing to project`, error);
      throw new WsException('Internal server error');
    }
  }

  @SubscribeMessage('progress:update')
  handleProgressUpdate(
    @MessageBody() data: { projectId: string; progress: number },
    @ConnectedSocket() client: Socket,
  ) {
    try {
      if (!data?.projectId || data?.progress === undefined)
        throw new WsException('Invalid payload');
      this.server.to(`project:${data.projectId}`).emit('progress:updated', data);
      this.logger.debug(`Progress update emitted for project: ${data.projectId}`);
    } catch (error: any) {
      this.logger.error(`Error handling progress update`, error);
      throw new WsException('Internal server error');
    }
  }
}
