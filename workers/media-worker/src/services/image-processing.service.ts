import { Injectable } from '@nestjs/common';
import { Worker } from 'worker_threads';
import { join } from 'path';
import { ImageVariant, MediaMetadata } from '../interfaces/processing-options.interface';

@Injectable()
export class ImageProcessingService {
  private readonly workerPath = join(__dirname, 'image-worker.worker.js');

  private runWorker(action: string, input: Buffer, options: any = {}): Promise<any> {
    return new Promise((resolve, reject) => {
      const worker = new Worker(this.workerPath, {
        workerData: { action, input, options },
      });

      worker.on('message', (message) => {
        if (message.error) {
          reject(new Error(message.error));
        } else {
          resolve(message.result);
        }
      });

      worker.on('error', reject);
      worker.on('exit', (code) => {
        if (code !== 0) {
          reject(new Error(`Worker stopped with exit code ${code}`));
        }
      });
    });
  }

  async resize(input: Buffer, variant: ImageVariant): Promise<Buffer> {
    return this.runWorker('resize', input, variant);
  }

  async compress(input: Buffer, quality = 80): Promise<Buffer> {
    return this.runWorker('compress', input, { quality });
  }

  async extractMetadata(input: Buffer): Promise<MediaMetadata> {
    return this.runWorker('metadata', input);
  }

  async generateThumbnail(input: Buffer): Promise<Buffer> {
    return this.runWorker('thumbnail', input);
  }
}
