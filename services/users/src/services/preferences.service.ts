import { Injectable } from '@nestjs/common';
import { PrismaWriteService, PrismaReadService } from '@nestlancer/database';
import { UpdatePreferencesDto } from '../dto/update-preferences.dto';

@Injectable()
export class PreferencesService {
  constructor(
    private readonly prismaWrite: PrismaWriteService,
    private readonly prismaRead: PrismaReadService,
  ) {}

  async getPreferences(userId: string) {
    const prefs = await this.prismaRead.userPreferences.findUnique({
      where: { userId },
    });

    return {
      notifications: prefs?.emailNotifications || {},
      privacy: prefs?.privacySettings || {},
    };
  }

  async updatePreferences(userId: string, dto: UpdatePreferencesDto) {
    const updated = await this.prismaWrite.userPreferences.upsert({
      where: { userId },
      update: {
        emailNotifications: dto.notifications as any,
        privacySettings: dto.privacy as any,
      },
      create: {
        userId,
        emailNotifications: dto.notifications as any,
        privacySettings: dto.privacy as any,
      },
    });

    return {
      notifications: updated.emailNotifications,
      privacy: updated.privacySettings,
      updatedAt: updated.updatedAt,
    };
  }
}
