import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import {
    ItSupportTicketDto,
    ItSupportTicketDetailDto,
    ItSupportTicketCreateDto,
    ItSupportCommentDto,
    PageResponse,
    TicketStatus
} from '../models/it-support.model';

@Injectable({
    providedIn: 'root'
})
export class ItSupportService {
    private apiUrl = '/api/it-support';

    constructor(private http: HttpClient) { }

    /**
     * Get current user's tickets
     */
    getMyTickets(page: number = 0, size: number = 20): Observable<PageResponse<ItSupportTicketDto>> {
        const params = new HttpParams()
            .set('page', page.toString())
            .set('size', size.toString())
            .set('sort', 'createdAt,desc');
        return this.http.get<PageResponse<ItSupportTicketDto>>(`${this.apiUrl}/tickets/my`, { params });
    }

    /**
     * Get ticket details by ID
     */
    getTicketDetails(id: string): Observable<ItSupportTicketDetailDto> {
        return this.http.get<ItSupportTicketDetailDto>(`${this.apiUrl}/tickets/${id}`);
    }

    /**
     * Create a new ticket
     */
    createTicket(dto: ItSupportTicketCreateDto): Observable<ItSupportTicketDto> {
        return this.http.post<ItSupportTicketDto>(`${this.apiUrl}/tickets`, dto);
    }

    /**
     * Add comment to ticket
     */
    addComment(ticketId: string, message: string): Observable<ItSupportCommentDto> {
        return this.http.post<ItSupportCommentDto>(`${this.apiUrl}/tickets/${ticketId}/comments`, { message });
    }

    /**
     * Close a ticket
     */
    closeTicket(ticketId: string): Observable<ItSupportTicketDto> {
        return this.http.put<ItSupportTicketDto>(`${this.apiUrl}/tickets/${ticketId}/close`, {});
    }

    /**
     * Create ticket with file upload (multipart form data)
     */
    createTicketWithFile(formData: FormData): Observable<ItSupportTicketDto> {
        return this.http.post<ItSupportTicketDto>(`${this.apiUrl}/tickets`, formData);
    }

    /**
     * Download attachment from ticket
     */
    downloadAttachment(ticketId: string, attachmentId: string): Observable<Blob> {
        return this.http.get(`${this.apiUrl}/tickets/${ticketId}/attachments/${attachmentId}`, {
            responseType: 'blob'
        });
    }
}
