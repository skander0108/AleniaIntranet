import { Component, OnInit, inject, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, ActivatedRoute, Router } from '@angular/router';
import {
    KnowledgeBaseService,
    KnowledgeDocumentDto
} from '../../../core/services/knowledge-base.service';

@Component({
    selector: 'app-article-detail',
    standalone: true,
    imports: [CommonModule, RouterModule],
    template: `
    <div class="min-h-screen bg-gray-50 py-8 px-4 sm:px-6 lg:px-8">
      <div class="max-w-4xl mx-auto">
        <!-- Back Button -->
        <a routerLink="/knowledge-base" class="inline-flex items-center gap-2 text-gray-500 hover:text-blue-600 mb-6 transition-colors">
            <span class="material-symbols-outlined text-[20px]">arrow_back</span>
            Back to Knowledge Base
        </a>

        <div *ngIf="loading" class="flex justify-center py-12">
            <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        </div>

        <div *ngIf="!loading && article" class="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
            <!-- Header -->
            <div class="p-6 md:p-8 border-b border-gray-100 bg-gradient-to-r from-gray-50 to-white">
                <div class="flex items-center gap-2 text-sm text-blue-600 font-medium mb-3">
                    <span class="material-symbols-outlined text-[18px]">folder</span>
                    {{ article.categoryName || 'Uncategorized' }}
                </div>
                <h1 class="text-2xl md:text-3xl font-bold text-gray-900 mb-4">{{ article.title }}</h1>
                
                <div class="flex flex-wrap items-center gap-4 text-sm text-gray-500">
                    <div class="flex items-center gap-1">
                        <span class="material-symbols-outlined text-[16px]">calendar_today</span>
                        Updated {{ article.updatedAt | date:'mediumDate' }}
                    </div>
                    <div class="flex items-center gap-1">
                        <span class="material-symbols-outlined text-[16px]">visibility</span>
                        {{ article.viewCount || 0 }} views
                    </div>
                </div>
            </div>

            <!-- Content -->
            <div class="p-6 md:p-8 prose prose-blue max-w-none">
                <!-- Simple content rendering for now. In future, use markdown pipe or innerHTML if safe -->
                <div class="whitespace-pre-wrap text-gray-700 leading-relaxed">{{ article.content }}</div>
            </div>

            <!-- Footer / Feedback -->
            <div class="p-6 md:p-8 bg-gray-50 border-t border-gray-100 flex flex-col md:flex-row items-center justify-between gap-4">
                <div class="text-gray-600 font-medium">Was this article helpful?</div>
                <div class="flex gap-3">
                    <button class="flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 rounded-lg hover:border-green-300 hover:text-green-700 transition-colors shadow-sm">
                        <span class="material-symbols-outlined">thumb_up</span>
                        Yes
                    </button>
                    <button class="flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 rounded-lg hover:border-red-300 hover:text-red-700 transition-colors shadow-sm">
                        <span class="material-symbols-outlined">thumb_down</span>
                        No
                    </button>
                </div>
            </div>
        </div>

        <div *ngIf="!loading && !article" class="text-center py-12">
            <span class="material-symbols-outlined text-4xl text-gray-300 mb-2">error</span>
            <h2 class="text-xl font-bold text-gray-900">Article not found</h2>
            <p class="text-gray-500 mt-2">The article you are looking for does not exist or has been removed.</p>
            <button routerLink="/knowledge-base" class="mt-4 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
                Return to Knowledge Base
            </button>
        </div>
      </div>
    </div>
  `
})
export class ArticleDetailComponent implements OnInit {
    private route = inject(ActivatedRoute);
    private kbService = inject(KnowledgeBaseService);
    private cdr = inject(ChangeDetectorRef);

    article: KnowledgeDocumentDto | null = null;
    loading = false;

    ngOnInit() {
        this.route.paramMap.subscribe(params => {
            const id = params.get('id');
            if (id) {
                this.loadArticle(id);
            }
        });
    }

    loadArticle(id: string) {
        this.loading = true;
        this.kbService.getDocument(id).subscribe({
            next: (doc) => {
                this.article = doc;
                this.loading = false;
                this.cdr.detectChanges();
            },
            error: (err) => {
                console.error(err);
                this.loading = false;
                this.cdr.detectChanges();
            }
        });
    }
}
