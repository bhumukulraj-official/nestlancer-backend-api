export class BackupResponseDto {
    id: string;
    description?: string | null;
    size?: bigint | null;
    status: string;
    type: string;
    downloadUrl?: string;
    createdAt: Date;
}
