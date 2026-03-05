import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestlancer/config';
import { LoggerModule } from '@nestlancer/logger';
import { DatabaseModule } from '@nestlancer/database';
import { AuthLibModule } from '@nestlancer/auth-lib';
import { StorageModule } from '@nestlancer/storage';
import { OutboxModule } from '@nestlancer/outbox';
import { CacheModule } from '@nestlancer/cache';
import messagingConfig from './config/messaging.config';

import { MessagesAdminController } from './controllers/admin/messages.admin.controller';
import { ConversationsController } from './controllers/user/conversations.controller';
import { MessagesController } from './controllers/user/messages.controller';
import { MessageThreadsController } from './controllers/user/message-threads.controller';

import {
    MessagingService,
    ConversationsService,
    MessageThreadsService,
    MessageReactionsService,
    MessageSearchService,
    MessageReadService,
    UnreadCountService,
} from './services';

@Module({
    imports: [
        ConfigModule,
        LoggerModule,
        DatabaseModule.forRoot(),
        AuthLibModule,
        StorageModule.forRoot(),
        OutboxModule.forRoot(),
        CacheModule.forRoot(),
    ],
    controllers: [
        MessagesAdminController,
        ConversationsController,
        MessagesController,
        MessageThreadsController,
    ],
    providers: [
        MessagingService,
        ConversationsService,
        MessageThreadsService,
        MessageReactionsService,
        MessageSearchService,
        MessageReadService,
        UnreadCountService,
    ],
})
export class AppModule { }
