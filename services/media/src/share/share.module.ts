import { Module } from '@nestjs/common';
import { ShareController } from './share.controller';
import { ShareService } from './share.service';
import { DatabaseModule } from '@nestlancer/database';
import { StorageModule } from '../storage/storage.module';
import { CryptoModule } from '@nestlancer/crypto';
import { ConfigModule } from '@nestlancer/config';

@Module({
    imports: [DatabaseModule, StorageModule, CryptoModule, ConfigModule],
    controllers: [ShareController],
    providers: [ShareService],
    exports: [ShareService],
})
export class ShareModule { }
