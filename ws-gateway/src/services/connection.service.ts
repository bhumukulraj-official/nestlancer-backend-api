import { Injectable, Logger } from '@nestjs/common';

@Injectable()
export class WsConnectionService {
  private readonly logger = new Logger(WsConnectionService.name);
  private readonly connections = new Map<string, Set<string>>();

  addConnection(userId: string, socketId: string): void {
    const userSockets = this.connections.get(userId) || new Set();
    userSockets.add(socketId);
    this.connections.set(userId, userSockets);
    this.logger.debug(`Added connection for user ${userId}: ${socketId}`);
  }

  removeConnection(userId: string, socketId: string): void {
    const userSockets = this.connections.get(userId);
    if (userSockets) {
      userSockets.delete(socketId);
      if (userSockets.size === 0) this.connections.delete(userId);
    }
  }

  isOnline(userId: string): boolean {
    return this.connections.has(userId);
  }

  getConnectedUsers(): string[] {
    return Array.from(this.connections.keys());
  }
}
