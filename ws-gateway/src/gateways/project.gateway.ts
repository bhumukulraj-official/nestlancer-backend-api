import { WebSocketGateway, SubscribeMessage, MessageBody, ConnectedSocket, WebSocketServer, OnGatewayConnection, OnGatewayDisconnect } from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { Logger, UseGuards } from '@nestjs/common';
import { WsAuthGuard } from '@nestlancer/websocket';

@WebSocketGateway({ namespace: '/projects', cors: { origin: '*' } })
@UseGuards(WsAuthGuard)
export class ProjectGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer() server!: Server;
  private readonly logger = new Logger(ProjectGateway.name);

  handleConnection(client: Socket) { this.logger.log(`Client connected: ${client.id}`); }
  handleDisconnect(client: Socket) { this.logger.log(`Client disconnected: ${client.id}`); }

  @SubscribeMessage('subscribe:project')
  handleSubscribe(@MessageBody() data: { projectId: string }, @ConnectedSocket() client: Socket) {
    client.join(`project:${data.projectId}`);
    return { event: 'subscribed', data: { projectId: data.projectId } };
  }

  @SubscribeMessage('progress:update')
  handleProgressUpdate(@MessageBody() data: { projectId: string; progress: number }) {
    this.server.to(`project:${data.projectId}`).emit('progress:updated', data);
  }
}
