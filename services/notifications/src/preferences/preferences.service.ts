import { Injectable } from '@nestjs/common';
import { PrismaWriteService, PrismaReadService, ReadOnly } from '@nestlancer/database';
import { UpdatePreferencesDto } from '../dto/update-preferences.dto';

type InMemoryPreferenceRecord = {
  userId: string;
  preferences: Record<string, any>;
  quietHoursStart: string | null;
  quietHoursEnd: string | null;
  quietHoursTimezone: string;
  updatedAt: Date;
};

const inMemoryPreferences = new Map<string, InMemoryPreferenceRecord>();

@Injectable()
export class PreferencesService {
  constructor(
    private readonly prismaWrite: PrismaWriteService,
    private readonly prismaRead: PrismaReadService,
  ) {}

  @ReadOnly()
  async getPreferences(userId: string) {
    const prismaClient =
      (this.prismaRead as any).notificationPreference || (this.prismaWrite as any).notificationPreference;

    // Fallback to an in-memory store when the notificationPreference model is not
    // present on the Prisma client (e.g. when the schema has not been fully applied).
    if (!prismaClient) {
      let pref = inMemoryPreferences.get(userId);
      if (!pref) {
        pref = {
          userId,
          preferences: {},
          quietHoursStart: null,
          quietHoursEnd: null,
          quietHoursTimezone: 'UTC',
          updatedAt: new Date(),
        };
        inMemoryPreferences.set(userId, pref);
      }

      return {
        userId: pref.userId,
        preferences: pref.preferences,
        quietHours: {
          start: pref.quietHoursStart,
          end: pref.quietHoursEnd,
          timezone: pref.quietHoursTimezone,
        },
        updatedAt: pref.updatedAt,
      };
    }

    let pref = await prismaClient.findUnique({
      where: { userId },
    });

    if (!pref) {
      pref = await prismaClient.create({
        data: {
          userId,
          preferences: {},
          quietHoursStart: null,
          quietHoursEnd: null,
          quietHoursTimezone: 'UTC',
        },
      });
    }

    return {
      userId: pref.userId,
      preferences: pref.preferences,
      quietHours: {
        start: pref.quietHoursStart,
        end: pref.quietHoursEnd,
        timezone: pref.quietHoursTimezone,
      },
      updatedAt: pref.updatedAt,
    };
  }

  async updatePreferences(userId: string, dto: UpdatePreferencesDto) {
    const prismaClient =
      (this.prismaWrite as any).notificationPreference || (this.prismaRead as any).notificationPreference;

    if (!prismaClient) {
      const existing = inMemoryPreferences.get(userId) || {
        userId,
        preferences: {},
        quietHoursStart: null,
        quietHoursEnd: null,
        quietHoursTimezone: 'UTC',
        updatedAt: new Date(),
      };

      const next: InMemoryPreferenceRecord = {
        ...existing,
        preferences: dto.preferences ?? existing.preferences,
        quietHoursStart: dto.quietHours?.start ?? existing.quietHoursStart,
        quietHoursEnd: dto.quietHours?.end ?? existing.quietHoursEnd,
        quietHoursTimezone: dto.quietHours?.timezone ?? existing.quietHoursTimezone,
        updatedAt: new Date(),
      };

      inMemoryPreferences.set(userId, next);

      return {
        channels: next.preferences,
        updatedAt: next.updatedAt,
      };
    }

    const dataToUpdate: any = {};

    if (dto.preferences) {
      dataToUpdate.preferences = dto.preferences;
    }

    if (dto.quietHours) {
      dataToUpdate.quietHoursStart = dto.quietHours.start;
      dataToUpdate.quietHoursEnd = dto.quietHours.end;
      dataToUpdate.quietHoursTimezone = dto.quietHours.timezone;
    }

    const updated = await prismaClient.upsert({
      where: { userId },
      create: {
        userId,
        preferences: dto.preferences || {},
        quietHoursStart: dto.quietHours?.start || null,
        quietHoursEnd: dto.quietHours?.end || null,
        quietHoursTimezone: dto.quietHours?.timezone || 'UTC',
      },
      update: dataToUpdate,
    });

    return {
      channels: updated.preferences,
      updatedAt: updated.updatedAt,
    };
  }

  @ReadOnly()
  async getChannels() {
    return [
      { id: 'inApp', name: 'In-App Notifications', status: 'available' },
      { id: 'email', name: 'Email Notifications', status: 'available' },
      { id: 'push', name: 'Push Notifications', status: 'requires_subscription' },
    ];
  }
}
