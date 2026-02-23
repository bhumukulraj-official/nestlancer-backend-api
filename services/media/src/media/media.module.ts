import { Module } from '@nestjs/common';
import { MediaController } from './media.controller';
import { MediaAdminController } from './media.admin.controller';
import { MediaService } from './media.service';
import { MediaAdminService } from './media-admin.service';
import { StorageService } from '../storage/storage.service';
import { StorageModule } from '@nestlancer/storage';
import { DatabaseModule } from '@nestlancer/database';
import { QueueModule } from '@nestlancer/queue';
import { CacheModule } from '@nestlancer/cache';

@Module({
    imports: [StorageModule, DatabaseModule, QueueModule, CacheModule],
    controllers: [MediaController, MediaAdminController],
    providers: [MediaService, MediaAdminService, StorageService],
    exports: [MediaService, StorageService]
})
export class MediaModule { }
