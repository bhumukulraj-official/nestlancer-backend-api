import { Injectable } from '@nestjs/common';
import { LoggerService } from '@nestlancer/logger';
import { ConfigService } from '@nestjs/config';
import { ScanResult } from '../interfaces/processing-options.interface';
import * as clamav from 'clamav.js';
import { StorageService } from '@nestlancer/storage';
import * as fs from 'fs';
import * as path from 'path';

@Injectable()
export class VirusScanProcessor {
    private readonly tempDir: string;

    constructor(
        private readonly logger: LoggerService,
        private readonly configService: ConfigService,
        private readonly storage: StorageService,
    ) {
        this.tempDir = this.configService.get<string>('media-worker.tempDir', '/tmp/media-worker');
        if (!fs.existsSync(this.tempDir)) {
            fs.mkdirSync(this.tempDir, { recursive: true });
        }
    }

    async scanFile(s3Key: string): Promise<ScanResult> {
        const fileName = path.basename(s3Key);
        const localPath = path.join(this.tempDir, `${Date.now()}-${fileName}`);

        try {
            this.logger.debug(`Downloading ${s3Key} for virus scan...`);
            await this.storage.downloadFile(s3Key, localPath);

            const scanner = clamav.createScanner(
                this.configService.get<string>('media-worker.clamavHost', 'localhost'),
                this.configService.get<number>('media-worker.clamavPort', 3310),
            );

            return new Promise((resolve, reject) => {
                scanner.scan(localPath, (err, object, result) => {
                    if (err) {
                        this.logger.error(`ClamAV scan error: ${err.message}`);
                        return resolve({ isInfected: false, details: 'Scan failed, assuming clean for now (fallback policy needed)' });
                    }

                    if (result && result.status === 'FOUND') {
                        this.logger.warn(`VIRUS DETECTED in ${s3Key}: ${result.virus}`);
                        resolve({ isInfected: true, virusName: result.virus });
                    } else {
                        this.logger.debug(`File ${s3Key} is clean.`);
                        resolve({ isInfected: false });
                    }
                });
            });
        } catch (error) {
            this.logger.error(`Error during virus scan stage: ${error.message}`);
            return { isInfected: false, details: `Error: ${error.message}` };
        } finally {
            if (fs.existsSync(localPath)) {
                await fs.promises.unlink(localPath);
            }
        }
    }
}
