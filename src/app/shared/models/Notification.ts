export interface Notification {
    id: number;
    type: 'like' | 'comment' | 'follow' | 'mention';
    message: string;
    createdAt: Date;
    isRead: boolean;
    userId: number;
    relatedPostId: number;
}