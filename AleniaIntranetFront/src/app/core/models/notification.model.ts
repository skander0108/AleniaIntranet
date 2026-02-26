export interface Notification {
    id: string;
    title: string;
    message: string;
    targetType?: 'GLOBAL' | 'ROLE' | 'USER';
    type: string; // JOINER_CREATED, EVENT_CREATED, etc.
    entityId?: string;
    linkUrl?: string;
    createdAt: string;
    isRead: boolean;
}
