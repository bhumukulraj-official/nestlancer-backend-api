import { Injectable } from '@nestjs/common';
import * as ffmpeg from 'fluent-ffmpeg';
import { MediaMetadata } from '../interfaces/processing-options.interface';
import { Readable, Writable } from 'stream';

@Injectable()
export class VideoProcessingService {
    async getInfo(inputPath: string): Promise<MediaMetadata> {
        return new Promise((resolve, reject) => {
            ffmpeg.ffprobe(inputPath, (err, metadata) => {
                if (err) return reject(err);
                const videoStream = metadata.streams.find(s => s.codec_type === 'video');
                resolve({
                    width: videoStream?.width,
                    height: videoStream?.height,
                    duration: metadata.format.duration,
                    bitrate: metadata.format.bit_rate,
                    codec: videoStream?.codec_name,
                });
            });
        });
    }

    async extractFrame(inputPath: string, outputPath: string, timeSeconds = 1): Promise<void> {
        return new Promise((resolve, reject) => {
            ffmpeg(inputPath)
                .screenshots({
                    timestamps: [timeSeconds],
                    filename: 'thumbnail.jpg',
                    folder: '/tmp', // Temp folder, should be configurable
                    size: '300x200',
                })
                .on('end', () => resolve())
                .on('error', (err) => reject(err));
        });
    }
}
