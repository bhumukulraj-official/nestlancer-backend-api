import { Module } from '@nestjs/common';
import { ShareController } from './share.controller';
import { ShareService } from './share.service';
import { DatabaseModule } from '@nestlancer/database';
import { StorageModule } from '@nestlancer/storage';

@Module({
    imports: [DatabaseModule, StorageModule],
    controllers: [ShareController],
    providers: [ShareService],
    exports: [ShareService],
})
export class ShareModule { }
