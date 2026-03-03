import { IsBoolean, IsUUID } from 'class-validator';

export class RestoreBackupDto {
    @IsUUID()
    backupId: string;

    @IsBoolean()
    confirmRestore: boolean; // must be true
}
