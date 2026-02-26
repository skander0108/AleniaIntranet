export enum TicketCategory {
    HARDWARE = 'HARDWARE',
    SOFTWARE = 'SOFTWARE',
    ACCESS = 'ACCESS',
    NETWORK = 'NETWORK',
    EMAIL = 'EMAIL',
    FACILITIES = 'FACILITIES',
    OTHER = 'OTHER'
}

export enum TicketPriority {
    LOW = 'LOW',
    MEDIUM = 'MEDIUM',
    HIGH = 'HIGH',
    URGENT = 'URGENT'
}

export enum TicketStatus {
    OPEN = 'OPEN',
    IN_PROGRESS = 'IN_PROGRESS',
    WAITING_USER = 'WAITING_USER',
    RESOLVED = 'RESOLVED',
    CLOSED = 'CLOSED'
}

export interface ItSupportTicketCreateDto {
    title: string;
    category: TicketCategory;
    priority: TicketPriority;
    description: string;
    preferredContact?: string;
}

export interface ItSupportTicketDto {
    id: string;
    ticketNumber: string;
    title: string;
    category: TicketCategory;
    priority: TicketPriority;
    status: TicketStatus;
    requesterName: string;
    assignedToName?: string;
    createdAt: string;
    updatedAt: string;
}

export interface ItSupportCommentDto {
    id: string;
    authorName: string;
    message: string;
    createdAt: string;
}

export interface ItSupportAttachmentDto {
    id: string;
    fileName: string;
    contentType: string;
    fileSize: number;
    uploadedAt: string;
}

export interface ItSupportTicketDetailDto {
    id: string;
    ticketNumber: string;
    title: string;
    category: TicketCategory;
    priority: TicketPriority;
    status: TicketStatus;
    description: string;
    preferredContact?: string;
    requesterName: string;
    assignedToName?: string;
    createdAt: string;
    updatedAt: string;
    updatedByName?: string;
    comments: ItSupportCommentDto[];
    attachments: ItSupportAttachmentDto[];
}

export interface TicketUpdateDto {
    status?: TicketStatus;
    assignedToId?: string;
}

export interface PageResponse<T> {
    content: T[];
    totalElements: number;
    totalPages: number;
    size: number;
    number: number;
}

export interface ItSupportAuditLogDto {
    id: string;
    action: string;
    changedByFullName: string;
    oldValue?: string;
    newValue?: string;
    timestamp: string;
}

export interface ItSupportMetricsDto {
    totalTickets: number;
    openTickets: number;
    resolvedTickets: number;
    avgResolutionTimeHours: number;
    ticketsByCategory: Record<string, number>;
    ticketsByPriority: Record<string, number>;
}
