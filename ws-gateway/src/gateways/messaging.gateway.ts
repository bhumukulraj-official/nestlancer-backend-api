import { WebSocketGateway, SubscribeMessage, MessageBody, ConnectedSocket, WebSocketServer } from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { Logger, UseGuards } from '@nestjs/common';
import { WsAuthGuard } from '@nestlancer/websocket';

@WebSocketGateway({ namespace: '/messages', cors: { origin: '*' } })
@UseGuards(WsAuthGuard)
export class MessagingGateway {
  @WebSocketServer() server!: Server;
  private readonly logger = new Logger(MessagingGateway.name);

  @SubscribeMessage('join:room')
  handleJoinRoom(@MessageBody() data: { projectId: string }, @ConnectedSocket() client: Socket) {
    client.join(`chat:${data.projectId}`);
    return { event: 'joined', data };
  }

  @SubscribeMessage('message:send')
  handleMessage(@MessageBody() data: { projectId: string; content: string; type?: string }, @ConnectedSocket() client: Socket) {
    const message = { ...data, senderId: client.data?.user?.userId, createdAt: new Date().toISOString() };
    this.server.to(`chat:${data.projectId}`).emit('message:new', message);
    return { event: 'message:sent', data: message };
  }

  @SubscribeMessage('typing:start')
  handleTypingStart(@MessageBody() data: { projectId: string }, @ConnectedSocket() client: Socket) {
    client.to(`chat:${data.projectId}`).emit('typing:indicator', { userId: client.data?.user?.userId, isTyping: true });
  }

  @SubscribeMessage('typing:stop')
  handleTypingStop(@MessageBody() data: { projectId: string }, @ConnectedSocket() client: Socket) {
    client.to(`chat:${data.projectId}`).emit('typing:indicator', { userId: client.data?.user?.userId, isTyping: false });
  }
}
