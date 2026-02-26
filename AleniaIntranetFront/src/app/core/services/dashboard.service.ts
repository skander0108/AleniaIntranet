import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

// Define interfaces for the data based on Backend Entities
export interface Event {
    id: string;
    title: string;
    eventDate: string;
    eventTime: string;
    location: string;
    type?: 'indigo' | 'orange' | 'green' | 'blue'; // Optional UI property
}

export interface Announcement {
    id: string;
    title: string;
    content: string;
    publishedAt: string; // ISO date string
    status: string;
    summary?: string;
    imageUrl?: string;
    category?: string;
    isFeatured?: boolean;
}

export interface QuickLink {
    id: string;
    label: string;
    url: string;
    isActive: boolean;
    description?: string;
    icon?: string;
}

export interface Tool {
    id: string;
    name: string;
    url: string;
    icon?: string;
    colorTheme?: string;
    description?: string;
}

@Injectable({
    providedIn: 'root'
})
export class DashboardService {
    private http = inject(HttpClient);
    // Assuming backend runs on port 8080. typically proxy.conf.json is better but hardcoding for simplicity now.
    private apiUrl = '/api/dashboard';

    getFeaturedNews(): Observable<Announcement> {
        return this.http.get<Announcement>(`${this.apiUrl}/news/featured`);
    }

    getNewsFeed(): Observable<Announcement[]> {
        return this.http.get<Announcement[]>(`${this.apiUrl}/news/feed`);
    }

    getUpcomingEvents(): Observable<Event[]> {
        return this.http.get<Event[]>(`${this.apiUrl}/events`);
    }

    getExternalHubs(): Observable<QuickLink[]> {
        return this.http.get<QuickLink[]>(`${this.apiUrl}/hubs`);
    }

    getTools(): Observable<Tool[]> {
        return this.http.get<Tool[]>(`${this.apiUrl}/tools`);
    }
}
