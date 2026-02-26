import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { LeaveBalance, LeaveRequest, LeaveRequestCreate, LeaveType, PageResponse, LeaveStatus } from '../models/leave.model';

@Injectable({
    providedIn: 'root'
})
export class LeaveService {
    private apiUrl = '/api/leaves';

    constructor(private http: HttpClient) { }

    getLeaveTypes(): Observable<LeaveType[]> {
        return this.http.get<LeaveType[]>(`${this.apiUrl}/types`);
    }

    getMyBalances(): Observable<LeaveBalance[]> {
        return this.http.get<LeaveBalance[]>(`${this.apiUrl}/my-balances`);
    }

    createRequest(request: LeaveRequestCreate): Observable<LeaveRequest> {
        return this.http.post<LeaveRequest>(`${this.apiUrl}/requests`, request);
    }

    getMyRequests(page: number = 0, size: number = 10): Observable<PageResponse<LeaveRequest>> {
        const params = new HttpParams()
            .set('page', page.toString())
            .set('size', size.toString())
            .set('sort', 'createdAt,desc');
        return this.http.get<PageResponse<LeaveRequest>>(`${this.apiUrl}/requests`, { params });
    }

    getRequest(id: string): Observable<LeaveRequest> {
        return this.http.get<LeaveRequest>(`${this.apiUrl}/requests/${id}`);
    }

    cancelRequest(id: string): Observable<LeaveRequest> {
        return this.http.put<LeaveRequest>(`${this.apiUrl}/requests/${id}/cancel`, {});
    }

    // Manager / Admin Endpoints

    getTeamRequests(page: number = 0, size: number = 10, status?: LeaveStatus): Observable<PageResponse<LeaveRequest>> {
        let params = new HttpParams()
            .set('page', page.toString())
            .set('size', size.toString())
            .set('sort', 'createdAt,desc');

        if (status) {
            params = params.set('status', status);
        }

        return this.http.get<PageResponse<LeaveRequest>>(`${this.apiUrl}/team/requests`, { params });
    }

    approveRequest(id: string): Observable<LeaveRequest> {
        return this.http.put<LeaveRequest>(`${this.apiUrl}/requests/${id}/approve`, {});
    }

    rejectRequest(id: string, reason: string): Observable<LeaveRequest> {
        return this.http.put<LeaveRequest>(`${this.apiUrl}/requests/${id}/reject`, { reason });
    }

    getUserBalances(userId: string): Observable<LeaveBalance[]> {
        return this.http.get<LeaveBalance[]>(`${this.apiUrl}/admin/users/${userId}/balances`);
    }
}
