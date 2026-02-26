import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

export interface KnowledgeCategoryDto {
    id: string;
    name: string;
    description: string;
    icon: string;
}

export interface KnowledgeDocumentDto {
    id: string;
    title: string;
    content: string;
    categoryId: string;
    categoryName: string;
    tags: string[];
    viewCount: number;
    helpfulCount: number;
    createdAt: string;
    updatedAt: string;
}

export interface PageResponse<T> {
    content: T[];
    totalElements: number;
    totalPages: number;
    size: number;
    number: number;
}

@Injectable({
    providedIn: 'root'
})
export class KnowledgeBaseService {
    private http = inject(HttpClient);
    private apiUrl = `${environment.apiUrl}`;

    // Categories
    getCategories(page: number = 0, size: number = 20): Observable<PageResponse<KnowledgeCategoryDto>> {
        let params = new HttpParams()
            .set('page', page.toString())
            .set('size', size.toString());
        return this.http.get<PageResponse<KnowledgeCategoryDto>>(`${this.apiUrl}/knowledge-categories`, { params });
    }

    createCategory(category: Partial<KnowledgeCategoryDto>): Observable<KnowledgeCategoryDto> {
        return this.http.post<KnowledgeCategoryDto>(`${this.apiUrl}/knowledge-categories`, category);
    }

    // Documents
    getDocuments(page: number = 0, size: number = 20, categoryId?: string): Observable<PageResponse<KnowledgeDocumentDto>> {
        let params = new HttpParams()
            .set('page', page.toString())
            .set('size', size.toString());

        if (categoryId) {
            params = params.set('categoryId', categoryId);
        }

        return this.http.get<PageResponse<KnowledgeDocumentDto>>(`${this.apiUrl}/knowledge-documents`, { params });
    }

    getDocument(id: string): Observable<KnowledgeDocumentDto> {
        return this.http.get<KnowledgeDocumentDto>(`${this.apiUrl}/knowledge-documents/${id}`);
    }

    createDocument(document: Partial<KnowledgeDocumentDto>): Observable<KnowledgeDocumentDto> {
        return this.http.post<KnowledgeDocumentDto>(`${this.apiUrl}/knowledge-documents`, document);
    }

    updateDocument(id: string, document: Partial<KnowledgeDocumentDto>): Observable<KnowledgeDocumentDto> {
        return this.http.put<KnowledgeDocumentDto>(`${this.apiUrl}/knowledge-documents/${id}`, document);
    }
}
