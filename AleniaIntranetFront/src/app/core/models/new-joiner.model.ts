export interface NewJoiner {
    id: string;
    fullName: string;
    jobTitle: string;
    department: string;
    startDate: string; // ISO date string
    location?: string;
    photoUrl?: string; // e.g. /api/joiners/images/uuid.jpg
    cvFileId?: string;
    cvFileName?: string;
    cvMimeType?: string;
    cvSizeBytes?: number;
}

export interface PageResponse<T> {
    content: T[];
    totalElements: number;
    totalPages: number;
    size: number;
    number: number;
}
