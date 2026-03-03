import { IsArray, IsUUID } from 'class-validator';

export class MarkSelectedReadDto {
    @IsArray()
    @IsUUID(undefined, { each: true })
    notificationIds: string[];
}
