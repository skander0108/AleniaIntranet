import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { forkJoin } from 'rxjs';
import { map } from 'rxjs/operators';

import { DashboardService, Announcement } from '../../../core/services/dashboard.service';
import { NewJoinerService } from '../../../core/services/new-joiner.service';
import { DocumentService } from '../../../core/services/document.service';
import { KnowledgeBaseService, KnowledgeDocumentDto } from '../../../core/services/knowledge-base.service';
import { NewJoiner } from '../../../core/models/new-joiner.model';

@Component({
  selector: 'app-search-page',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './search-page.html',
  styleUrl: './search-page.css',
})
export class SearchPage implements OnInit {
  private route = inject(ActivatedRoute);
  private dashboardService = inject(DashboardService);
  private joinerService = inject(NewJoinerService);
  private docService = inject(DocumentService);
  private kbService = inject(KnowledgeBaseService);

  query = '';
  isSearching = false;

  newsResults: Announcement[] = [];
  peopleResults: NewJoiner[] = [];
  documentResults: any[] = [];
  kbResults: KnowledgeDocumentDto[] = [];

  hasResults = false;

  ngOnInit(): void {
    this.route.queryParams.subscribe(params => {
      this.query = params['q'] || '';
      if (this.query.trim()) {
        this.performSearch(this.query.trim().toLowerCase());
      } else {
        this.resetResults();
      }
    });
  }

  resetResults() {
    this.newsResults = [];
    this.peopleResults = [];
    this.documentResults = [];
    this.kbResults = [];
    this.hasResults = false;
    this.isSearching = false;
  }

  performSearch(query: string) {
    this.isSearching = true;

    forkJoin({
      news: this.dashboardService.getNewsFeed(),
      people: this.joinerService.getAll(0, 200).pipe(map(res => res.content)),
      docs: this.docService.getDocuments(query, 0, 20).pipe(map(res => res.content)),
      kb: this.kbService.getDocuments(0, 200).pipe(map(res => res.content))
    }).subscribe({
      next: (data) => {
        // Client-side filter for News
        this.newsResults = data.news.filter(n =>
          n.title.toLowerCase().includes(query) ||
          (n.summary && n.summary.toLowerCase().includes(query))
        );

        // Client-side filter for People
        this.peopleResults = data.people.filter(p =>
          p.fullName.toLowerCase().includes(query) ||
          p.jobTitle.toLowerCase().includes(query) ||
          p.department.toLowerCase().includes(query)
        );

        // Docs are server-side filtered
        this.documentResults = data.docs || [];

        // Client-side filter for Knowledge Base
        this.kbResults = data.kb.filter(k =>
          k.title.toLowerCase().includes(query) ||
          k.content.toLowerCase().includes(query) ||
          k.tags.some(t => t.toLowerCase().includes(query))
        );

        this.hasResults = this.newsResults.length > 0 ||
          this.peopleResults.length > 0 ||
          this.documentResults.length > 0 ||
          this.kbResults.length > 0;

        this.isSearching = false;
      },
      error: (err) => {
        console.error('Search error:', err);
        this.isSearching = false;
      }
    });
  }
}
