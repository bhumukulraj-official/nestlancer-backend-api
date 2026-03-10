import { Injectable, BadRequestException } from '@nestjs/common';
import { CacheService } from '@nestlancer/cache';
import { SystemConfigService } from './system-config.service';
import { ToggleMaintenanceDto } from '../dto/toggle-maintenance.dto';

@Injectable()
export class MaintenanceModeService {
  private readonly MAINTENANCE_KEY = 'MAINTENANCE_MODE';

  constructor(
    private readonly configService: SystemConfigService,
    private readonly cacheService: CacheService,
  ) {}

  async getStatus() {
    try {
      const config = await this.configService.get(this.MAINTENANCE_KEY);
      return config;
    } catch {
      return { enabled: false };
    }
  }

  async toggle(dto: ToggleMaintenanceDto, userId: string) {
    const currentStatus = await this.getStatus();

    if (currentStatus.enabled === dto.enabled) {
      throw new BadRequestException(
        dto.enabled ? 'Maintenance mode already active' : 'Maintenance mode already disabled',
      );
    }

    const newConfig = {
      enabled: dto.enabled,
      message: dto.message || 'System is under maintenance. Please check back later.',
      estimatedEnd: dto.estimatedEnd,
      updatedAt: new Date().toISOString(),
      updatedBy: userId,
    };

    await this.configService.set({ key: this.MAINTENANCE_KEY, value: newConfig }, userId);

    // PubSub event to notify gateway/frontend

    return newConfig;
  }
}
