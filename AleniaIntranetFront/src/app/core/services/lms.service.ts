import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface LmsProgressDto {
    id: string;
    userId: string;
    userFullName: string;
    courseId: string;
    courseTitle: string;
    courseType: string;
    status: string;
    completionDate: string | null;
    score: number | null;
    maxScore: number | null;
    updatedAt: string;
}

export interface LmsSyncLogDto {
    id: string;
    syncType: string;
    status: string;
    startedAt: string;
    finishedAt: string | null;
    message: string | null;
    recordsCount: number;
}

export interface LmsUserCourseProgressDto {
    userFullName: string;
    email: string;
    ispringUserId: string;
    courseId: string;
    courseTitle: string;
    courseType: string;
    status: string;
    score: number | null;
    maxScore: number | null;
    completionDate: string | null;
    timeSpent: string | null;
}

export interface Page<T> {
    content: T[];
    pageable: {
        pageNumber: number;
        pageSize: number;
    };
    totalElements: number;
    totalPages: number;
    size: number;
    number: number;
}

@Injectable({
    providedIn: 'root'
})
export class LmsService {
    private readonly API = '/api/lms';

    constructor(private http: HttpClient) { }

    getMyProgress(): Observable<LmsProgressDto[]> {
        return this.http.get<LmsProgressDto[]>(`${this.API}/my-progress`);
    }

    getTeamProgress(): Observable<LmsProgressDto[]> {
        return this.http.get<LmsProgressDto[]>(`${this.API}/team-progress`);
    }

    getGlobalProgress(): Observable<LmsProgressDto[]> {
        return this.http.get<LmsProgressDto[]>(`${this.API}/global-progress`);
    }

    triggerSync(): Observable<LmsSyncLogDto> {
        return this.http.post<LmsSyncLogDto>(`${this.API}/sync`, {});
    }

    getSyncLogs(): Observable<LmsSyncLogDto[]> {
        return this.http.get<LmsSyncLogDto[]>(`${this.API}/sync/logs`);
    }

    getPaginatedUsersProgress(page: number, size: number, search: string = ''): Observable<Page<LmsUserCourseProgressDto>> {
        let url = `${this.API}/users-progress?page=${page}&size=${size}`;
        if (search) {
            url += `&search=${encodeURIComponent(search)}`;
        }
        return this.http.get<Page<LmsUserCourseProgressDto>>(url);
    }

    exportCsv(data: LmsProgressDto[], filename: string): void {
        const headers = ['User', 'Course', 'Type', 'Status', 'Completion Date', 'Score', 'Max Score'];
        const rows = data.map(d => [
            d.userFullName,
            d.courseTitle,
            d.courseType || '',
            d.status,
            d.completionDate || '',
            d.score?.toString() || '',
            d.maxScore?.toString() || ''
        ]);
        const csv = [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
        const blob = new Blob([csv], { type: 'text/csv' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = filename;
        a.click();
        URL.revokeObjectURL(url);
    }
}
