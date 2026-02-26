import { Component, OnInit, inject, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import {
    KnowledgeBaseService,
    KnowledgeCategoryDto,
    KnowledgeDocumentDto,
    PageResponse
} from '../../core/services/knowledge-base.service';

@Component({
    selector: 'app-knowledge-base',
    standalone: true,
    imports: [CommonModule, RouterModule],
    template: `
    <div class="min-h-screen bg-gray-50 py-8 px-4 sm:px-6 lg:px-8">
      <div class="max-w-7xl mx-auto">
        <h1 class="text-3xl font-bold text-gray-900 mb-2">Knowledge Base</h1>
        <p class="text-gray-500 mb-8">Find answers, policies, and guides.</p>

        <!-- Search (Simple Placeholder for now) -->
        <div class="mb-10 max-w-2xl relative">
            <input 
                type="text" 
                placeholder="Search for articles..." 
                class="w-full pl-10 pr-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500 shadow-sm"
            >
            <span class="material-symbols-outlined absolute left-3 top-3.5 text-gray-400">search</span>
        </div>

        <div class="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <!-- Categories Column -->
            <div class="lg:col-span-1">
                <h2 class="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
                    <span class="material-symbols-outlined text-blue-600">category</span>
                    Categories
                </h2>
                <div *ngIf="loadingCategories" class="text-gray-500">Loading categories...</div>
                
                <div class="space-y-3">
                    <div *ngFor="let category of categories" 
                         (click)="selectCategory(category)"
                         [class.bg-blue-50]="selectedCategoryId === category.id"
                         [class.border-blue-200]="selectedCategoryId === category.id"
                         class="p-4 bg-white rounded-lg border border-gray-100 hover:shadow-md transition-all cursor-pointer flex items-center justify-between group">
                         <div class="flex items-center gap-3">
                             <div class="w-10 h-10 rounded-full bg-gray-50 flex items-center justify-center text-gray-500 group-hover:bg-blue-100 group-hover:text-blue-600 transition-colors">
                                <span class="material-symbols-outlined">{{ category.icon || 'article' }}</span>
                             </div>
                             <div>
                                 <h3 class="font-semibold text-gray-900">{{ category.name }}</h3>
                                 <p class="text-xs text-gray-500 line-clamp-1">{{ category.description }}</p>
                             </div>
                         </div>
                         <span class="material-symbols-outlined text-gray-300 group-hover:text-blue-500">chevron_right</span>
                    </div>
                </div>
            </div>

            <!-- Articles Column -->
            <div class="lg:col-span-2">
                <h2 class="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
                    <span class="material-symbols-outlined text-blue-600">article</span>
                    {{ selectedCategoryName || 'All Articles' }}
                </h2>

                <div *ngIf="loadingDocuments" class="flex justify-center py-8">
                    <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                </div>

                <div *ngIf="!loadingDocuments && documents.length === 0" class="p-8 text-center bg-white rounded-xl border border-dashed border-gray-300">
                    <span class="material-symbols-outlined text-4xl text-gray-300 mb-2">content_paste_off</span>
                    <p class="text-gray-500">No articles found in this category.</p>
                </div>

                <div class="grid gap-4">
                    <a *ngFor="let doc of documents" 
                       [routerLink]="['/knowledge-base', doc.id]"
                       class="block bg-white p-6 rounded-xl border border-gray-100 shadow-sm hover:shadow-md hover:border-blue-200 transition-all cursor-pointer group">
                        <div class="flex justify-between items-start mb-2">
                            <h3 class="text-lg font-bold text-gray-900 group-hover:text-blue-600 transition-colors">{{ doc.title }}</h3>
                            <span class="px-2 py-1 bg-gray-50 text-xs text-gray-500 rounded text-center min-w-[60px]">
                                {{ doc.createdAt | date:'MMM d' }}
                            </span>
                        </div>
                        <p class="text-gray-600 text-sm mb-4 line-clamp-2">{{ doc.content | slice:0:150 }}...</p>
                        <div class="flex items-center justify-between text-xs text-gray-400">
                            <div class="flex items-center gap-4">
                                <span class="flex items-center gap-1">
                                    <span class="material-symbols-outlined text-[14px]">visibility</span>
                                    {{ doc.viewCount || 0 }} views
                                </span>
                                <span class="flex items-center gap-1">
                                    <span class="material-symbols-outlined text-[14px]">thumb_up</span>
                                    {{ doc.helpfulCount || 0 }} helpful
                                </span>
                            </div>
                            <span class="flex items-center gap-1 text-blue-500 font-medium opacity-0 group-hover:opacity-100 transition-opacity">
                                Read Article <span class="material-symbols-outlined text-[14px]">arrow_forward</span>
                            </span>
                        </div>
                    </a>
                </div>
                
                <!-- Simple Pagination -->
                <div *ngIf="totalPages > 1" class="mt-6 flex justify-center gap-2">
                     <button (click)="changePage(currentPage - 1)" [disabled]="currentPage === 0" 
                        class="px-4 py-2 bg-white border border-gray-200 rounded-lg disabled:opacity-50 hover:bg-gray-50">
                        Previous
                     </button>
                     <span class="px-4 py-2 text-gray-600 bg-gray-50 rounded-lg">Page {{ currentPage + 1 }} of {{ totalPages }}</span>
                     <button (click)="changePage(currentPage + 1)" [disabled]="currentPage >= totalPages - 1" 
                        class="px-4 py-2 bg-white border border-gray-200 rounded-lg disabled:opacity-50 hover:bg-gray-50">
                        Next
                     </button>
                </div>
            </div>
        </div>
      </div>
    </div>
  `
})
export class KnowledgeBaseComponent implements OnInit {
    private kbService = inject(KnowledgeBaseService);
    private cdr = inject(ChangeDetectorRef);

    categories: KnowledgeCategoryDto[] = [];
    documents: KnowledgeDocumentDto[] = [];

    loadingCategories = false;
    loadingDocuments = false;

    selectedCategoryId: string | null = null;
    selectedCategoryName: string | null = null;

    currentPage = 0;
    pageSize = 10;
    totalPages = 0;

    ngOnInit() {
        this.loadCategories();
        this.loadDocuments();
    }

    loadCategories() {
        this.loadingCategories = true;
        this.kbService.getCategories(0, 50).subscribe({ // Load all cats for sidebar
            next: (res) => {
                this.categories = res.content;
                this.loadingCategories = false;
                this.cdr.detectChanges();
            },
            error: (err) => {
                console.error(err);
                this.loadingCategories = false;
                this.cdr.detectChanges();
            }
        });
    }

    loadDocuments() {
        this.loadingDocuments = true;
        this.kbService.getDocuments(this.currentPage, this.pageSize, this.selectedCategoryId || undefined).subscribe({
            next: (res) => {
                this.documents = res.content;
                this.totalPages = res.totalPages;
                this.loadingDocuments = false;
                this.cdr.detectChanges();
            },
            error: (err) => {
                console.error(err);
                this.loadingDocuments = false;
                this.cdr.detectChanges();
            }
        });
    }

    selectCategory(category: KnowledgeCategoryDto) {
        if (this.selectedCategoryId === category.id) {
            // Deselect
            this.selectedCategoryId = null;
            this.selectedCategoryName = null;
        } else {
            this.selectedCategoryId = category.id;
            this.selectedCategoryName = category.name;
        }
        this.currentPage = 0;
        this.loadDocuments();
    }

    changePage(page: number) {
        if (page >= 0 && page < this.totalPages) {
            this.currentPage = page;
            this.loadDocuments();
        }
    }
}
