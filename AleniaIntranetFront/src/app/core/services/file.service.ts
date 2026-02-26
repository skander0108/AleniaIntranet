import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
    providedIn: 'root'
})
export class FileService {
    private http = inject(HttpClient);
    private apiUrl = '/api/files';

    upload(file: File): Observable<{ filename: string, url: string }> {
        const formData = new FormData();
        formData.append('file', file);

        return this.http.post<{ filename: string, url: string }>(`${this.apiUrl}/upload`, formData);
    }
}
