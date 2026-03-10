export enum MessageType {
  TEXT = 'TEXT',
  FILE = 'FILE',
  SYSTEM = 'SYSTEM',
  NOTIFICATION = 'NOTIFICATION',
}

export interface MessageReaction {
  userId: string;
  emoji: string;
  createdAt: Date;
}

export interface MessageReadReceipt {
  userId: string;
  readAt: Date;
}

export interface Message {
  id: string;
  projectId: string;
  senderId: string;
  content?: string;
  replyToId?: string;
  type: MessageType;
  readBy?: MessageReadReceipt[];
  reactions?: MessageReaction[];
  editedAt?: Date;
  deletedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}
