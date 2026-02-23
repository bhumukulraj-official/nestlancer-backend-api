import { Module } from '@nestjs/common';
import { StorageService } from './storage.service';
import { StorageModule as LibStorageModule } from '@nestlancer/storage';

@Module({
    imports: [LibStorageModule],
    providers: [StorageService],
    exports: [StorageService],
})
export class StorageModule { }
