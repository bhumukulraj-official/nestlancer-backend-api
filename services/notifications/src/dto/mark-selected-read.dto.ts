import { IsArray, IsUUID } from 'class-validator';

export class MarkSelectedReadDto {
    @IsArray()
    @IsUUID('4', { each: true })
    notificationIds: string[];
}
