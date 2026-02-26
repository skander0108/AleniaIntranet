import { Component, OnInit, OnDestroy, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { Subject } from 'rxjs';
import { debounceTime, takeUntil, distinctUntilChanged } from 'rxjs/operators';
import { DocumentService } from '../../../core/services/document.service';
import { AuthService } from '../../../core/services/auth.service';
import { Document } from '../../../core/models/document.model';

@Component({
    selector: 'app-documents-list',
    standalone: true,
    imports: [CommonModule, RouterModule, ReactiveFormsModule],
    templateUrl: './documents-list.component.html',
    styleUrls: ['./documents-list.component.scss']
})
export class DocumentsListComponent implements OnInit, OnDestroy {
    documents: Document[] = [];
    isLoading = true;
    searchControl = new FormControl('');

    isAdmin = false;
    isManager = false;

    private destroy$ = new Subject<void>();

    // Pagination implementation placeholder
    currentPage = 0;
    pageSize = 20;

    constructor(
        private documentService: DocumentService,
        private authService: AuthService,
        private cdr: ChangeDetectorRef
    ) { }

    ngOnInit(): void {
        this.checkUserRoles();
        this.setupSearch();
        this.loadDocuments();
    }

    ngOnDestroy(): void {
        this.destroy$.next();
        this.destroy$.complete();
    }

    private checkUserRoles(): void {
        const roles = this.authService.getUserRoles();
        this.isAdmin = roles.includes('ROLE_ADMIN');
        this.isManager = roles.includes('ROLE_MANAGER');
    }

    private setupSearch(): void {
        this.searchControl.valueChanges.pipe(
            debounceTime(400),
            distinctUntilChanged(),
            takeUntil(this.destroy$)
        ).subscribe(searchTerm => {
            this.currentPage = 0; // Reset to first page
            this.loadDocuments(searchTerm || '');
        });
    }

    private loadDocuments(search: string = ''): void {
        this.isLoading = true;
        this.documentService.getDocuments(search, this.currentPage, this.pageSize)
            .pipe(takeUntil(this.destroy$))
            .subscribe({
                next: (response) => {
                    this.documents = response.content;
                    this.isLoading = false;
                    this.cdr.detectChanges();
                },
                error: (error) => {
                    console.error('Error loading documents:', error);
                    this.isLoading = false;
                    this.cdr.detectChanges();
                }
            });
    }

    download(doc: Document): void {
        this.documentService.downloadDocument(doc.id).subscribe({
            next: (blob) => {
                const url = window.URL.createObjectURL(blob);
                const link = document.createElement('a');
                link.href = url;
                link.download = doc.fileName;
                link.click();
                window.URL.revokeObjectURL(url);
            },
            error: (error) => {
                console.error('Error downloading document:', error);
            }
        });
    }

    getFileIcon(contentType: string): string {
        if (!contentType) return 'description'; // default

        if (contentType.includes('pdf')) return 'picture_as_pdf';
        if (contentType.includes('word') || contentType.includes('document')) return 'description';
        if (contentType.includes('excel') || contentType.includes('spreadsheet')) return 'table_view';
        if (contentType.includes('powerpoint') || contentType.includes('presentation')) return 'slideshow';
        if (contentType.includes('image')) return 'image';
        if (contentType.includes('zip') || contentType.includes('compressed')) return 'folder_zip';

        return 'insert_drive_file';
    }

    getFileIconColor(contentType: string): string {
        // Helper to return tailwind/material text colors based on type
        if (!contentType) return 'text-gray-400';

        if (contentType.includes('pdf')) return 'text-red-500';
        if (contentType.includes('word') || contentType.includes('document')) return 'text-blue-500';
        if (contentType.includes('excel') || contentType.includes('spreadsheet')) return 'text-green-600';
        if (contentType.includes('powerpoint') || contentType.includes('presentation')) return 'text-orange-500';
        if (contentType.includes('image')) return 'text-purple-500';

        return 'text-gray-500';
    }
}
