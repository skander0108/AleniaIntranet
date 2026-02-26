import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { NewJoiner } from '../models/new-joiner.model';
import { environment } from '../../../environments/environment';

import { PageResponse } from '../models/new-joiner.model';

@Injectable({
    providedIn: 'root'
})
export class NewJoinerService {
    private apiUrl = `${environment.apiUrl}/joiners`;

    constructor(private http: HttpClient) { }

    getAll(page: number = 0, size: number = 10): Observable<PageResponse<NewJoiner>> {
        const params = {
            page: page.toString(),
            size: size.toString(),
            sort: 'startDate,desc'
        };
        return this.http.get<PageResponse<NewJoiner>>(this.apiUrl, { params });
    }

    get(id: string): Observable<NewJoiner> {
        return this.http.get<NewJoiner>(`${this.apiUrl}/${id}`);
    }

    create(data: any, photo?: File, cv?: File): Observable<NewJoiner> {
        const formData = new FormData();
        formData.append('fullName', data.fullName);
        formData.append('jobTitle', data.jobTitle);
        formData.append('department', data.department);
        formData.append('startDate', data.startDate);
        if (data.location) formData.append('location', data.location);
        if (photo) formData.append('photo', photo);
        if (cv) formData.append('cv', cv);

        return this.http.post<NewJoiner>(this.apiUrl, formData);
    }

    update(id: string, data: any, photo?: File, cv?: File): Observable<NewJoiner> {
        const formData = new FormData();
        formData.append('fullName', data.fullName);
        formData.append('jobTitle', data.jobTitle);
        formData.append('department', data.department);
        formData.append('startDate', data.startDate);
        if (data.location) formData.append('location', data.location);
        if (photo) formData.append('photo', photo);
        if (cv) formData.append('cv', cv);

        return this.http.put<NewJoiner>(`${this.apiUrl}/${id}`, formData);
    }

    downloadCv(id: string): Observable<Blob> {
        return this.http.get(`${this.apiUrl}/${id}/cv`, { responseType: 'blob' });
    }

    delete(id: string): Observable<void> {
        return this.http.delete<void>(`${this.apiUrl}/${id}`);
    }
}
