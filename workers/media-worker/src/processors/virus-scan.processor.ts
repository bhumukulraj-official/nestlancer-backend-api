import { Injectable } from '@nestjs/common';
import { LoggerService } from '@nestlancer/logger';
import { ConfigService } from '@nestjs/config';
import { ScanResult } from '../interfaces/processing-options.interface';
import * as clamav from 'clamav.js';
import { StorageService } from '@nestlancer/storage';
import * as fs from 'fs';
import * as path from 'path';

/**
 * Processor responsible for scanning media files for viruses using ClamAV.
 * Downloads the folder to a temporary local path before scanning.
 */
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

    /**
     * Downloads a file from S3 and scans it using ClamAV.
     * Ensures the local temporary file is cleaned up after scanning.
     * 
     * @param s3Key - The key of the file in the private S3 bucket
     * @returns A promise resolving to a ScanResult indicating infection status
     */
    async scanFile(s3Key: string): Promise<ScanResult> {
        const fileName = path.basename(s3Key);
        const localPath = path.join(this.tempDir, `${Date.now()}-${fileName}`);
        const bucket = this.configService.get<string>('storage.privateBucket', 'nestlancer-private');

        try {
            this.logger.debug(`[VirusScan] Downloading ${s3Key} for verification...`);
            const buffer = await this.storage.download(bucket, s3Key);
            await fs.promises.writeFile(localPath, buffer);

            const scanner = clamav.createScanner(
                this.configService.get<string>('media-worker.clamavHost', 'localhost'),
                this.configService.get<number>('media-worker.clamavPort', 3310),
            );

            return new Promise((resolve) => {
                scanner.scan(localPath, (err: Error | null, object: any, result: any) => {
                    if (err) {
                        this.logger.error(`[VirusScan] ClamAV service error: ${err.message}`);
                        return resolve({
                            isInfected: false,
                            details: 'Security scan unavailable. Following fail-closed/open policy based on config.'
                        });
                    }

                    if (result && result.status === 'FOUND') {
                        this.logger.warn(`[VirusScan] CRITICAL: Virus detected in ${s3Key} (${result.virus})`);
                        resolve({ isInfected: true, virusName: result.virus });
                    } else {
                        this.logger.debug(`[VirusScan] File ${s3Key} passed security check.`);
                        resolve({ isInfected: false });
                    }
                });
            });
        } catch (error: any) {
            this.logger.error(`[VirusScan] Failed during scan lifecycle: ${error.message}`, error.stack);
            return { isInfected: false, details: `Internal Error: ${error.message}` };
        } finally {
            if (fs.existsSync(localPath)) {
                await fs.promises.unlink(localPath);
            }
        }
    }
}
