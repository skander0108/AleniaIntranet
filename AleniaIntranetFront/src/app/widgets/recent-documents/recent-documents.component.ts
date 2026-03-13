import { Component, OnInit, inject, ChangeDetectionStrategy, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { DocumentService } from '../../core/services/document.service';

@Component({
    selector: 'app-recent-documents',
    standalone: true,
    imports: [CommonModule, RouterModule],
    changeDetection: ChangeDetectionStrategy.OnPush,
    template: `
        <div class="bg-surface-light dark:bg-surface-dark rounded-2xl border border-gray-100 dark:border-gray-700 p-5">
            <div class="flex items-center justify-between mb-4">
                <h3 class="text-base font-bold text-text-main dark:text-white flex items-center gap-2">
                    <span class="material-symbols-outlined text-primary text-xl">description</span>
                    Recent Documents
                </h3>
                <a routerLink="/documents" class="text-primary text-xs font-semibold hover:underline">View All</a>
            </div>
            <div *ngIf="isLoading" class="flex justify-center py-6">
                <div class="animate-spin rounded-full h-6 w-6 border-b-2 border-primary"></div>
            </div>
            <div *ngIf="!isLoading && documents.length === 0" class="text-center py-6">
                <span class="material-symbols-outlined text-3xl text-gray-300 dark:text-gray-600">folder_off</span>
                <p class="text-xs text-text-muted dark:text-gray-400 mt-2">No documents yet</p>
            </div>
            <div *ngIf="!isLoading && documents.length > 0" class="flex flex-col gap-2">
                <a *ngFor="let doc of documents" routerLink="/documents"
                    class="flex items-center gap-3 p-3 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors group cursor-pointer">
                    <div class="w-10 h-10 rounded-lg flex items-center justify-center shrink-0"
                        [ngClass]="getIconBg(doc.fileType)">
                        <span class="material-symbols-outlined text-lg" [ngClass]="getIconColor(doc.fileType)">
                            {{ getIcon(doc.fileType) }}
                        </span>
                    </div>
                    <div class="flex-1 min-w-0">
                        <p class="text-sm font-semibold text-text-main dark:text-white truncate group-hover:text-primary transition-colors">
                            {{ doc.title }}
                        </p>
                        <p class="text-xs text-text-muted dark:text-gray-400">
                            {{ doc.uploadDate | date:'MMM d' }} · {{ doc.category }}
                        </p>
                    </div>
                </a>
            </div>
        </div>
    `
})
export class RecentDocumentsComponent implements OnInit {
    private documentService = inject(DocumentService);
    private cdr = inject(ChangeDetectorRef);
    documents: any[] = [];
    isLoading = true;

    ngOnInit() {
        this.documentService.getDocuments('', 0, 5).subscribe({
            next: (res) => {
                this.documents = res.content || [];
                this.isLoading = false;
                this.cdr.markForCheck();
            },
            error: () => {
                this.isLoading = false;
                this.cdr.markForCheck();
            }
        });
    }

    getIcon(type: string): string {
        if (!type) return 'insert_drive_file';
        if (type.includes('pdf')) return 'picture_as_pdf';
        if (type.includes('word') || type.includes('document')) return 'description';
        if (type.includes('excel') || type.includes('spreadsheet')) return 'table_view';
        if (type.includes('image')) return 'image';
        return 'insert_drive_file';
    }

    getIconBg(type: string): string {
        if (!type) return 'bg-gray-100 dark:bg-gray-800';
        if (type.includes('pdf')) return 'bg-red-50 dark:bg-red-900/20';
        if (type.includes('word') || type.includes('document')) return 'bg-blue-50 dark:bg-blue-900/20';
        if (type.includes('excel') || type.includes('spreadsheet')) return 'bg-green-50 dark:bg-green-900/20';
        return 'bg-gray-100 dark:bg-gray-800';
    }

    getIconColor(type: string): string {
        if (!type) return 'text-gray-500';
        if (type.includes('pdf')) return 'text-red-500';
        if (type.includes('word') || type.includes('document')) return 'text-blue-500';
        if (type.includes('excel') || type.includes('spreadsheet')) return 'text-green-600';
        return 'text-gray-500';
    }
}
