import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable, Subject } from 'rxjs';
import { Notification } from '../models/notification.model';
import { environment } from '../../../environments/environment';

@Injectable({
    providedIn: 'root'
})
export class NotificationService {
    private apiUrl = '/api/notifications';
    private notificationsSubject = new BehaviorSubject<Notification[]>([]);
    private unreadCountSubject = new BehaviorSubject<number>(0);
    private toastSubject = new Subject<Notification>();

    public notifications$ = this.notificationsSubject.asObservable();
    public unreadCount$ = this.unreadCountSubject.asObservable();
    public toast$ = this.toastSubject.asObservable();

    private eventSource?: EventSource;
    private pollingInterval?: any;

    constructor(private http: HttpClient) {
        this.connectToNotificationStream();
    }

    // SSE Connection using Fetch API to support Authorization header
    private async connectToNotificationStream(): Promise<void> {
        if (this.eventSource) {
            this.eventSource.close();
            this.eventSource = undefined;
        }

        const token = localStorage.getItem('access_token') || sessionStorage.getItem('access_token');
        if (!token) {
            console.warn('No token found for SSE connection, falling back to polling');
            this.startPolling();
            return;
        }

        try {
            const response = await fetch(this.apiUrl + '/stream', {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            if (!response.ok) {
                throw new Error(`SSE connection failed: ${response.status}`);
            }

            const reader = response.body?.getReader();
            if (!reader) throw new Error('No reader available');

            const decoder = new TextDecoder();
            let buffer = '';

            // Read the stream
            while (true) {
                const { done, value } = await reader.read();
                if (done) break;

                buffer += decoder.decode(value, { stream: true });
                const lines = buffer.split('\n');

                // Process all complete lines
                buffer = lines.pop() || ''; // Keep the last partial line in buffer

                for (const line of lines) {
                    if (line.startsWith('data:')) {
                        try {
                            const data = line.slice(5).trim();
                            if (data) {
                                const notification: Notification = JSON.parse(data);
                                this.handleNewNotification(notification);
                            }
                        } catch (e) {
                            console.error('Error parsing SSE data', e);
                        }
                    }
                }
            }
        } catch (error) {
            console.warn('SSE stream error, falling back to polling:', error);
            this.startPolling();
        }
    }

    private startPolling(): void {
        if (this.pollingInterval) {
            clearInterval(this.pollingInterval);
        }

        this.loadNotifications();
        this.loadUnreadCount();

        this.pollingInterval = setInterval(() => {
            this.loadNotifications();
            this.loadUnreadCount();
        }, 60000);
    }

    private handleNewNotification(notification: Notification): void {
        const current = this.notificationsSubject.value;
        this.notificationsSubject.next([notification, ...current]);
        this.unreadCountSubject.next(this.unreadCountSubject.value + 1);
        this.toastSubject.next(notification);
    }

    // Public API Methods
    loadNotifications(size: number = 8): void {
        this.http.get<Notification[]>(`${this.apiUrl}?size=${size}`)
            .subscribe({
                next: (notifications) => this.notificationsSubject.next(notifications),
                error: (err) => console.error('Failed to load notifications', err)
            });
    }

    getNotifications(size: number = 20): Observable<Notification[]> {
        return this.http.get<Notification[]>(`${this.apiUrl}?size=${size}`);
    }

    loadUnreadCount(): void {
        this.http.get<number>(`${this.apiUrl}/unread-count`)
            .subscribe({
                next: (count) => this.unreadCountSubject.next(count),
                error: (err) => console.error('Failed to load unread count', err)
            });
    }

    getNotification(id: string): Observable<Notification> {
        return this.http.get<Notification>(`${this.apiUrl}/${id}`);
    }

    markAsRead(id: string): Observable<void> {
        return this.http.post<void>(`${this.apiUrl}/${id}/read`, {});
    }

    markAsUnread(id: string): Observable<void> {
        return this.http.post<void>(`${this.apiUrl}/${id}/unread`, {});
    }

    markAllAsRead(): Observable<void> {
        return this.http.post<void>(`${this.apiUrl}/read-all`, {});
    }

    refresh(): void {
        this.loadNotifications();
        this.loadUnreadCount();
    }

    disconnect(): void {
        // Fetch stream cancellation is handled by breaking the loop or abort controller
        if (this.pollingInterval) {
            clearInterval(this.pollingInterval);
        }
    }
}
