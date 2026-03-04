import { Test, TestingModule } from '@nestjs/testing';
import { VirusScanProcessor } from '../../../src/processors/virus-scan.processor';
import { StorageService } from '@nestlancer/storage';
import { ConfigService } from '@nestjs/config';
import { LoggerService } from '@nestlancer/logger';
import * as clamav from 'clamav.js';
import * as fs from 'fs';
import * as path from 'path';

jest.mock('clamav.js', () => ({
    createScanner: jest.fn(),
}));

jest.mock('fs', () => ({
    existsSync: jest.fn(),
    mkdirSync: jest.fn(),
    promises: {
        writeFile: jest.fn(),
        unlink: jest.fn(),
    },
}));

jest.mock('path', () => ({
    ...jest.requireActual('path'),
    basename: jest.fn((p) => 'testfile.txt'),
    join: jest.fn((p1, p2) => `${p1}/${p2}`),
}));

describe('VirusScanProcessor', () => {
    let processor: VirusScanProcessor;
    let storage: jest.Mocked<StorageService>;
    let configService: jest.Mocked<ConfigService>;
    let logger: jest.Mocked<LoggerService>;

    // Save original Date.now
    const originalDateNow = Date.now;

    beforeEach(async () => {
        // Mock Date.now to have predictable paths
        Date.now = jest.fn(() => 1234567890);

        (fs.existsSync as jest.Mock).mockReturnValue(true);

        const module: TestingModule = await Test.createTestingModule({
            providers: [
                VirusScanProcessor,
                {
                    provide: StorageService,
                    useValue: { download: jest.fn() },
                },
                {
                    provide: ConfigService,
                    useValue: { get: jest.fn().mockImplementation((key, defaultValue) => defaultValue) },
                },
                {
                    provide: LoggerService,
                    useValue: { debug: jest.fn(), error: jest.fn(), warn: jest.fn(), log: jest.fn(), verbose: jest.fn() },
                },
            ],
        }).compile();

        processor = module.get<VirusScanProcessor>(VirusScanProcessor);
        storage = module.get(StorageService);
        configService = module.get(ConfigService);
        logger = module.get(LoggerService);
    });

    afterEach(() => {
        jest.clearAllMocks();
        Date.now = originalDateNow;
    });

    it('should be defined', () => {
        expect(processor).toBeDefined();
    });

    describe('constructor', () => {
        it('should create temp directory if it does not exist', async () => {
            (fs.existsSync as jest.Mock).mockReturnValueOnce(false);

            // recreate module to trigger constructor again
            await Test.createTestingModule({
                providers: [
                    VirusScanProcessor,
                    { provide: StorageService, useValue: {} },
                    { provide: ConfigService, useValue: { get: jest.fn().mockReturnValue('/tmp/test') } },
                    { provide: LoggerService, useValue: {} },
                ],
            }).compile();

            expect(fs.mkdirSync).toHaveBeenCalledWith('/tmp/test', { recursive: true });
        });
    });

    describe('scanFile', () => {
        it('should download file, scan it, and find it clean', async () => {
            const buffer = Buffer.from('clean data');
            storage.download.mockResolvedValue(buffer);

            const mockScanner = {
                scan: jest.fn((path, callback) => callback(null, null, { status: 'OK' })),
            };
            (clamav.createScanner as jest.Mock).mockReturnValue(mockScanner);
            (fs.existsSync as jest.Mock).mockReturnValue(true); // file exists before unlink
            (fs.promises.writeFile as jest.Mock).mockResolvedValue(undefined);

            const result = await processor.scanFile('testfile.txt');

            expect(storage.download).toHaveBeenCalledWith('nestlancer-private', 'testfile.txt');
            expect(fs.promises.writeFile).toHaveBeenCalledWith(
                '/tmp/media-worker/1234567890-testfile.txt',
                buffer
            );
            expect(clamav.createScanner).toHaveBeenCalledWith('localhost', 3310);
            expect(mockScanner.scan).toHaveBeenCalled();
            expect(fs.promises.unlink).toHaveBeenCalledWith('/tmp/media-worker/1234567890-testfile.txt');

            expect(result).toEqual({ isInfected: false });
            expect(logger.debug).toHaveBeenCalledWith('File testfile.txt is clean.');
        });

        it('should handle virus found', async () => {
            storage.download.mockResolvedValue(Buffer.from('infected data'));
            const mockScanner = {
                scan: jest.fn((path, callback) => callback(null, null, { status: 'FOUND', virus: 'EICAR-Test-Signature' })),
            };
            (clamav.createScanner as jest.Mock).mockReturnValue(mockScanner);
            (fs.existsSync as jest.Mock).mockReturnValue(true);

            const result = await processor.scanFile('testfile.txt');

            expect(result).toEqual({ isInfected: true, virusName: 'EICAR-Test-Signature' });
            expect(logger.warn).toHaveBeenCalledWith('VIRUS DETECTED in testfile.txt: EICAR-Test-Signature');
        });

        it('should handle clamav scan error', async () => {
            storage.download.mockResolvedValue(Buffer.from('data'));
            const mockScanner = {
                scan: jest.fn((path, callback) => callback(new Error('Scanner offline'), null, null)),
            };
            (clamav.createScanner as jest.Mock).mockReturnValue(mockScanner);
            (fs.existsSync as jest.Mock).mockReturnValue(true);

            const result = await processor.scanFile('testfile.txt');

            expect(result).toEqual({ isInfected: false, details: 'Scan failed, assuming clean for now (fallback policy needed)' });
            expect(logger.error).toHaveBeenCalledWith('ClamAV scan error: Scanner offline');
        });

        it('should handle caught error during processing', async () => {
            storage.download.mockRejectedValue(new Error('S3 Download Failed'));

            const result = await processor.scanFile('testfile.txt');

            expect(result).toEqual({ isInfected: false, details: 'Error: S3 Download Failed' });
            expect(logger.error).toHaveBeenCalledWith('Error during virus scan stage: S3 Download Failed');
            // unlink not called because write failed/never reached, but let's assume it checks existsSync
            // it should unlink if it was called (mocked to true in this test case logic)
            expect(fs.promises.unlink).toHaveBeenCalledWith('/tmp/media-worker/1234567890-testfile.txt');
        });
    });
});
