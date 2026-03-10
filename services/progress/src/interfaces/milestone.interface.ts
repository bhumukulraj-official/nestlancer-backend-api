export enum MilestoneStatus {
  PENDING = 'PENDING',
  IN_PROGRESS = 'IN_PROGRESS',
  COMPLETED = 'COMPLETED',
  APPROVED = 'APPROVED',
  REVISION_REQUESTED = 'REVISION_REQUESTED',
}

export interface Milestone {
  id: string;
  projectId: string;
  name: string;
  description?: string;
  status: MilestoneStatus;
  startDate: Date;
  endDate: Date;
  completedAt?: Date;
  approvedAt?: Date;
  order: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface MilestoneWithDeliverables extends Milestone {
  deliverables: any[]; // To be typed later
}

export const MILESTONE_STATUS_FLOW = {
  [MilestoneStatus.PENDING]: [MilestoneStatus.IN_PROGRESS],
  [MilestoneStatus.IN_PROGRESS]: [MilestoneStatus.COMPLETED],
  [MilestoneStatus.COMPLETED]: [MilestoneStatus.APPROVED, MilestoneStatus.REVISION_REQUESTED],
  [MilestoneStatus.REVISION_REQUESTED]: [MilestoneStatus.COMPLETED],
  [MilestoneStatus.APPROVED]: [],
};
