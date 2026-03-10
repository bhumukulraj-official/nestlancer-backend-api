import { Module } from '@nestjs/common';
import { MediaController } from './media.controller';
import { MediaRootController } from './media-root.controller';
import { MediaAdminController } from './media.admin.controller';
import { MediaService } from './media.service';
import { MediaAdminService } from './media-admin.service';
import { StorageModule } from '../storage/storage.module';
import { DatabaseModule } from '@nestlancer/database';
import { QueueModule } from '@nestlancer/queue';
import { CacheModule } from '@nestlancer/cache';

@Module({
  imports: [StorageModule, DatabaseModule, QueueModule, CacheModule],
  controllers: [MediaRootController, MediaController, MediaAdminController],
  providers: [MediaService, MediaAdminService],
  exports: [MediaService],
})
export class MediaModule {}
