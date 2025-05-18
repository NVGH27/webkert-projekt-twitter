import { Timestamp } from '@angular/fire/firestore';

export interface Notification {
  id?: string;
  type: 'like' | 'comment' | 'follow' | 'mention';
  message: string;
  createdAt: Timestamp;
  isRead: boolean;
  userId: string;
  relatedPostId: string;
}
