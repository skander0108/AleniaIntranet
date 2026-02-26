import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Event } from '../models/event.model';
import { environment } from '../../../environments/environment';

@Injectable({
    providedIn: 'root'
})
export class EventService {
    private apiUrl = `${environment.apiUrl}/events`;

    constructor(private http: HttpClient) { }

    getAllEvents(): Observable<Event[]> {
        return this.http.get<Event[]>(this.apiUrl);
    }

    getEvent(id: string): Observable<Event> {
        return this.http.get<Event>(`${this.apiUrl}/${id}`);
    }

    getMyEvents(): Observable<Event[]> {
        return this.http.get<Event[]>(`${this.apiUrl}/my`);
    }

    createEvent(event: Partial<Event>): Observable<Event> {
        return this.http.post<Event>(this.apiUrl, event);
    }

    updateEvent(id: string, event: Partial<Event>): Observable<Event> {
        return this.http.put<Event>(`${this.apiUrl}/${id}`, event);
    }

    deleteEvent(id: string): Observable<void> {
        return this.http.delete<void>(`${this.apiUrl}/${id}`);
    }

    // Event Registration
    registerForEvent(eventId: string): Observable<void> {
        return this.http.post<void>(`${this.apiUrl}/${eventId}/register`, {});
    }

    unregisterFromEvent(eventId: string): Observable<void> {
        return this.http.delete<void>(`${this.apiUrl}/${eventId}/register`);
    }

    getMyRegisteredEvents(): Observable<Event[]> {
        return this.http.get<Event[]>(`${this.apiUrl}/me/registered`);
    }

    isRegisteredForEvent(eventId: string): Observable<boolean> {
        return this.http.get<boolean>(`${this.apiUrl}/${eventId}/is-registered`);
    }
}
