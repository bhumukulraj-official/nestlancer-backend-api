import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestlancer/config';
import { DatabaseModule } from '@nestlancer/database';
import { CacheModule } from '@nestlancer/cache';
import { AuthLibModule } from '@nestlancer/auth-lib';
import { LoggerModule } from '@nestlancer/logger';
import { TracingModule } from '@nestlancer/tracing';
import { ProjectGateway } from './gateways/project.gateway';
import { MessagingGateway } from './gateways/messaging.gateway';
import { NotificationGateway } from './gateways/notification.gateway';
import { WsConnectionService } from './services/connection.service';
import { WsPresenceService } from './services/presence.service';

@Module({
  imports: [
    ConfigModule,
    DatabaseModule,
    CacheModule,
    AuthLibModule,
    LoggerModule,
    TracingModule,
  ],
  providers: [
    ProjectGateway,
    MessagingGateway,
    NotificationGateway,
    WsConnectionService,
    WsPresenceService,
  ],
})
export class WsAppModule {}
