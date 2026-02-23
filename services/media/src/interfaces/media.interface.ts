export interface SupportedMimeTypes {
    images: string[];
    documents: string[];
    archives: string[];
    videos: string[];
}

export const SUPPORTED_MIME_TYPES: SupportedMimeTypes = {
    images: ['image/jpeg', 'image/png', 'image/webp', 'image/svg+xml'],
    documents: ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'],
    archives: ['application/zip', 'application/x-zip-compressed'],
    videos: ['video/mp4', 'video/webm'],
};

export const MAX_FILE_SIZES = {
    image: 10 * 1024 * 1024, // 10MB
    document: 20 * 1024 * 1024, // 20MB
    archive: 100 * 1024 * 1024, // 100MB
    video: 500 * 1024 * 1024, // 500MB
};

export enum MediaStatus {
    PENDING = 'PENDING',
    PROCESSING = 'PROCESSING',
    READY = 'READY',
    FAILED = 'FAILED',
    QUARANTINED = 'QUARANTINED'
}

export enum FileType {
    IMAGE = 'IMAGE',
    DOCUMENT = 'DOCUMENT',
    ARCHIVE = 'ARCHIVE',
    VIDEO = 'VIDEO'
}
