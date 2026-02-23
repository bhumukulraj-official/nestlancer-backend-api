import { IsBoolean, IsUUID } from 'class-validator';

export class RestoreBackupDto {
    @IsUUID('4')
    backupId: string;

    @IsBoolean()
    confirmRestore: boolean; // must be true
}
