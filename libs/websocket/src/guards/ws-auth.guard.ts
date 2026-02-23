import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { WsException } from '@nestjs/websockets';

@Injectable()
export class WsAuthGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    const client = context.switchToWs().getClient();
    const token = client.handshake?.auth?.token || client.handshake?.headers?.authorization?.replace('Bearer ', '');
    if (!token) throw new WsException({ code: 'AUTH_WS_UNAUTHORIZED', message: 'WebSocket authentication required' });
    // In production: verify JWT and attach user to client data
    return true;
  }
}
