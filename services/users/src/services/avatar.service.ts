import { Injectable } from '@nestjs/common';
import { PrismaWriteService, PrismaReadService } from '@nestlancer/database';
import { StorageService } from '@nestlancer/storage';
import { BusinessLogicException } from '@nestlancer/common';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class AvatarService {
    constructor(
        private readonly prismaWrite: PrismaWriteService,
        private readonly prismaRead: PrismaReadService,
        private readonly storageService: StorageService,
        private readonly config: ConfigService,
    ) { }

    async uploadAvatar(userId: string, file: Express.Multer.File) {
        const allowedMimeTypes = this.config.get<string[]>('usersService.avatar.allowedMimeTypes') || ['image/jpeg', 'image/png', 'image/webp'];
        const maxSize = this.config.get<number>('usersService.avatar.maxSize') || 5242880;

        if (!allowedMimeTypes.includes(file.mimetype)) {
            throw new BusinessLogicException('Unsupported avatar format', 'USER_015');
        }

        if (file.size > maxSize) {
            throw new BusinessLogicException('Avatar file too large', 'USER_014');
        }

        const bucket = this.config.get<string>('usersService.avatar.s3Bucket') || 'avatars';
        const key = `users/${userId}/avatar_${Date.now()}`;

        // Upload to storage
        const url = await this.storageService.uploadFile(bucket, key, file.buffer, file.mimetype);

        // Get old avatar to delete
        const user = await this.prismaRead.user.findUnique({ where: { id: userId } });

        // Update DB
        await this.prismaWrite.user.update({
            where: { id: userId },
            data: { avatar: url }
        });

        // Delete old avatar if requested (optional logic)
        // if (user?.avatar) {
        //   await this.storageService.deleteFile(user.avatar);
        // }

        return { avatarUrl: url };
    }

    async removeAvatar(userId: string) {
        const user = await this.prismaRead.user.findUnique({ where: { id: userId } });

        if (user?.avatar) {
            await this.prismaWrite.user.update({
                where: { id: userId },
                data: { avatar: null }
            });
            // Optionally delete from storage
            // await this.storageService.deleteFile(user.avatar);
        }

        return true;
    }
}
