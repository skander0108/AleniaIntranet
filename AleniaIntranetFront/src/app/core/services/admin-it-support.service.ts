import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import {
    ItSupportTicketDto,
    ItSupportTicketDetailDto,
    PageResponse,
    TicketStatus,
    TicketPriority,
    TicketCategory,
    ItSupportCommentDto,
    TicketUpdateDto,
    ItSupportAuditLogDto,
    ItSupportMetricsDto
} from '../models/it-support.model';

export interface TicketFilters {
    status?: TicketStatus;
    priority?: TicketPriority;
    category?: TicketCategory;
    q?: string;
}

@Injectable({
    providedIn: 'root'
})
export class AdminItSupportService {
    private apiUrl = '/api/admin/it-support';

    constructor(private http: HttpClient) { }

    /**
     * Get all tickets with optional filters and pagination
     */
    getAllTickets(
        filters: TicketFilters,
        page: number = 0,
        size: number = 20,
        sort: string = 'createdAt,desc'
    ): Observable<PageResponse<ItSupportTicketDto>> {
        let params = new HttpParams()
            .set('page', page.toString())
            .set('size', size.toString())
            .set('sort', sort);

        if (filters.status) {
            params = params.set('status', filters.status);
        }
        if (filters.priority) {
            params = params.set('priority', filters.priority);
        }
        if (filters.category) {
            params = params.set('category', filters.category);
        }
        if (filters.q) {
            params = params.set('q', filters.q);
        }

        return this.http.get<PageResponse<ItSupportTicketDto>>(`${this.apiUrl}/tickets`, { params });
    }

    /**
     * Get ticket details by ID
     */
    getTicketDetails(id: string): Observable<ItSupportTicketDetailDto> {
        return this.http.get<ItSupportTicketDetailDto>(`${this.apiUrl}/tickets/${id}`);
    }

    /**
     * Update ticket (status and/or assignment)
     */
    updateTicket(id: string, updates: TicketUpdateDto): Observable<ItSupportTicketDetailDto> {
        return this.http.put<ItSupportTicketDetailDto>(`${this.apiUrl}/tickets/${id}`, updates);
    }

    /**
     * Add admin comment to ticket
     */
    addComment(id: string, message: string): Observable<ItSupportCommentDto> {
        return this.http.post<ItSupportCommentDto>(`${this.apiUrl}/tickets/${id}/comments`, { message });
    }

    /**
     * Get ticket audit log
     */
    getAuditLog(id: string): Observable<ItSupportAuditLogDto[]> {
        return this.http.get<ItSupportAuditLogDto[]>(`${this.apiUrl}/tickets/${id}/audit-log`);
    }

    /**
     * Convert ticket to KB article
     */
    convertToKb(id: string): Observable<void> {
        return this.http.post<void>(`${this.apiUrl}/tickets/${id}/convert-to-kb`, {});
    }

    /**
     * Get IT Support Metrics
     */
    getMetrics(): Observable<ItSupportMetricsDto> {
        return this.http.get<ItSupportMetricsDto>(`${this.apiUrl}/metrics`);
    }
}
