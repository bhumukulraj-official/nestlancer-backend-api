export enum DeliverableStatus {
  UPLOADED = 'UPLOADED',
  APPROVED = 'APPROVED',
  REJECTED = 'REJECTED',
}

export interface Deliverable {
  id: string;
  milestoneId: string;
  description?: string;
  mediaId: string;
  status: DeliverableStatus;
  version: number;
  reviewedAt?: Date;
  reviewedBy?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface DeliverableWithMedia extends Deliverable {
  media: any; // Type from media service
}

export interface DeliverableReview {
  status: DeliverableStatus;
  reason?: string;
  rating?: number;
  feedback?: string;
  requestedChanges?: string[];
}
