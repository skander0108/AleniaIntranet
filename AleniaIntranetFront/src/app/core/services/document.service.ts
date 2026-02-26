import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { Document } from '../models/document.model';

@Injectable({
    providedIn: 'root'
})
export class DocumentService {
    private apiUrl = `${environment.apiUrl}/documents`;

    constructor(private http: HttpClient) { }

    uploadDocument(formData: FormData): Observable<Document> {
        return this.http.post<Document>(`${this.apiUrl}/upload`, formData);
    }

    getDocuments(search: string = '', page: number = 0, size: number = 10): Observable<any> {
        let params = new HttpParams()
            .set('page', page.toString())
            .set('size', size.toString());

        if (search) {
            params = params.set('search', search);
        }

        return this.http.get<any>(this.apiUrl, { params });
    }

    downloadDocument(id: number): Observable<Blob> {
        return this.http.get(`${this.apiUrl}/download/${id}`, {
            responseType: 'blob'
        });
    }

    updateDocument(id: number, formData: FormData): Observable<Document> {
        return this.http.put<Document>(`${this.apiUrl}/${id}`, formData);
    }

    deleteDocument(id: number): Observable<void> {
        return this.http.delete<void>(`${this.apiUrl}/${id}`);
    }
}
