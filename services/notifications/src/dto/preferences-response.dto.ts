export class PreferencesResponseDto {
    userId: string;
    preferences: Record<string, any>;
    quietHours: any;
    updatedAt: Date;
}
