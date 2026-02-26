import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

export interface Announcement {
    id: string;
    title: string;
    content: string;
    publishedAt: string;
    status: 'DRAFT' | 'PUBLISHED' | 'ARCHIVED';
    summary?: string;
    imageUrl?: string;
    category?: string;
    isFeatured?: boolean;
    priority?: 'NORMAL' | 'IMPORTANT' | 'URGENT';
    targetAudience?: 'ALL' | 'TEAM';
    publisherId?: string;
}

@Injectable({
    providedIn: 'root'
})
export class AnnouncementService {
    private http = inject(HttpClient);
    private apiUrl = '/api/announcements'; // Proxy config should handle /api

    getAll(page: number = 0, size: number = 10): Observable<any> {
        return this.http.get<any>(`${this.apiUrl}?page=${page}&size=${size}`);
    }

    getPublished(page: number = 0, size: number = 10): Observable<any> {
        return this.http.get<any>(`${this.apiUrl}/published?page=${page}&size=${size}`);
    }

    getMyAnnouncements(page: number = 0, size: number = 10): Observable<any> {
        return this.http.get<any>(`${this.apiUrl}/my?page=${page}&size=${size}&sort=publishedAt,desc`);
    }

    get(id: string): Observable<Announcement> {
        return this.http.get<Announcement>(`${this.apiUrl}/${id}`);
    }

    create(announcement: Partial<Announcement>): Observable<Announcement> {
        return this.http.post<Announcement>(this.apiUrl, announcement);
    }

    update(id: string, announcement: Partial<Announcement>): Observable<Announcement> {
        return this.http.put<Announcement>(`${this.apiUrl}/${id}`, announcement);
    }

    delete(id: string): Observable<void> {
        return this.http.delete<void>(`${this.apiUrl}/${id}`);
    }
}
