import { Injectable } from '@nestjs/common';
import { PrismaWriteService, PrismaReadService, ReadOnly } from '@nestlancer/database';
import { UpdatePreferencesDto } from '../dto/update-preferences.dto';

@Injectable()
export class PreferencesService {
    constructor(
        private readonly prismaWrite: PrismaWriteService,
        private readonly prismaRead: PrismaReadService,
    ) { }

    @ReadOnly()
    async getPreferences(userId: string) {
        let pref = await this.prismaRead.notificationPreference.findUnique({
            where: { userId },
        });

        if (!pref) {
            // Create defaults if not found
            pref = await this.prismaWrite.notificationPreference.create({
                data: {
                    userId,
                    preferences: {},
                    quietHoursStart: null,
                    quietHoursEnd: null,
                    quietHoursTimezone: 'UTC',
                }
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
        const dataToUpdate: any = {};

        if (dto.preferences) {
            dataToUpdate.preferences = dto.preferences;
        }

        if (dto.quietHours) {
            dataToUpdate.quietHoursStart = dto.quietHours.start;
            dataToUpdate.quietHoursEnd = dto.quietHours.end;
            dataToUpdate.quietHoursTimezone = dto.quietHours.timezone;
        }

        const updated = await this.prismaWrite.notificationPreference.upsert({
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
            { id: 'push', name: 'Push Notifications', status: 'requires_subscription' }
        ];
    }
}
