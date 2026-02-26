import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { map } from 'rxjs/operators';
import {
    ExpenseReport,
    ExpenseReportCreateDto,
    ExpenseLineCreateDto,
    ExpenseAuditLog
} from '../models/expense.model';

export interface Page<T> {
    content: T[];
    totalElements: number;
    totalPages: number;
    size: number;
    number: number;
}

@Injectable({
    providedIn: 'root'
})
export class ExpenseService {

    private apiUrl = `${environment.apiUrl}/expenses`;

    constructor(private http: HttpClient) { }

    getMyExpenses(page: number = 0, size: number = 10): Observable<Page<ExpenseReport>> {
        let params = new HttpParams()
            .set('page', page.toString())
            .set('size', size.toString());
        return this.http.get<Page<ExpenseReport>>(`${this.apiUrl}/my`, { params });
    }

    getPendingExpenses(page: number = 0, size: number = 10): Observable<Page<ExpenseReport>> {
        let params = new HttpParams()
            .set('page', page.toString())
            .set('size', size.toString());
        return this.http.get<Page<ExpenseReport>>(`${this.apiUrl}/pending`, { params });
    }

    getExpenseById(id: string): Observable<ExpenseReport> {
        return this.http.get<ExpenseReport>(`${this.apiUrl}/${id}`);
    }

    createExpenseReport(dto: ExpenseReportCreateDto): Observable<ExpenseReport> {
        return this.http.post<ExpenseReport>(this.apiUrl, dto);
    }

    updateExpenseReport(id: string, dto: ExpenseReportCreateDto): Observable<ExpenseReport> {
        return this.http.put<ExpenseReport>(`${this.apiUrl}/${id}`, dto);
    }

    deleteExpenseReport(id: string): Observable<void> {
        return this.http.delete<void>(`${this.apiUrl}/${id}`);
    }

    addExpenseLine(reportId: string, dto: ExpenseLineCreateDto, receipt?: File): Observable<ExpenseReport> {
        const formData = new FormData();
        formData.append('expenseLine', new Blob([JSON.stringify(dto)], {
            type: 'application/json'
        }));

        if (receipt) {
            formData.append('receipt', receipt);
        }

        return this.http.post<ExpenseReport>(`${this.apiUrl}/${reportId}/lines`, formData);
    }

    deleteExpenseLine(reportId: string, lineId: string): Observable<void> {
        return this.http.delete<void>(`${this.apiUrl}/${reportId}/lines/${lineId}`);
    }

    submitExpenseReport(id: string): Observable<ExpenseReport> {
        return this.http.post<ExpenseReport>(`${this.apiUrl}/${id}/submit`, {});
    }

    approveExpenseReport(id: string): Observable<ExpenseReport> {
        return this.http.post<ExpenseReport>(`${this.apiUrl}/${id}/approve`, {});
    }

    rejectExpenseReport(id: string, reason: string): Observable<ExpenseReport> {
        return this.http.post<ExpenseReport>(`${this.apiUrl}/${id}/reject`, reason);
    }

    payExpenseReport(id: string): Observable<ExpenseReport> {
        return this.http.post<ExpenseReport>(`${this.apiUrl}/${id}/pay`, {});
    }

    getAuditLogs(id: string): Observable<ExpenseAuditLog[]> {
        return this.http.get<ExpenseAuditLog[]>(`${this.apiUrl}/${id}/audit`);
    }
}
