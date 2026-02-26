import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Announcement } from './announcement.service';
import { Event } from '../models/event.model';
import { environment } from '../../../environments/environment';

@Injectable({
    providedIn: 'root'
})
export class NewsService {
    private http = inject(HttpClient);

    getAnnouncements(): Observable<Announcement[]> {
        return this.http.get<Announcement[]>('/api/announcements');
    }

    getEvents(): Observable<Event[]> {
        return this.http.get<Event[]>(`${environment.apiUrl}/events`);
    }
}
