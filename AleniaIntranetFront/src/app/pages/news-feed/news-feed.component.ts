import { Component, OnInit, inject, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { forkJoin, map } from 'rxjs';
import { NewsService } from '../../core/services/news.service';

export interface NewsItem {
    id: string | number;
    title: string;
    description: string;
    type: 'EVENT' | 'ANNOUNCEMENT';
    createdAt: Date | string;
    category?: string;
    location?: string;
    eventDate?: string;
    imageUrl?: string;
}

@Component({
    selector: 'app-news-feed',
    standalone: true,
    imports: [CommonModule, RouterModule],
    templateUrl: './news-feed.component.html',
    styleUrls: ['./news-feed.component.scss']
})
export class NewsFeedComponent implements OnInit {
    private newsService = inject(NewsService);
    private cdr = inject(ChangeDetectorRef);

    news: NewsItem[] = [];
    filteredNews: NewsItem[] = [];
    loading = true;
    currentFilter: string = 'Latest';

    ngOnInit() {
        this.loading = true;
        forkJoin([
            this.newsService.getAnnouncements(),
            this.newsService.getEvents()
        ]).pipe(
            map(([announcementsRes, eventsRes]) => {
                // Handle pagination structure if it exists, otherwise use the array
                const announcements = Array.isArray(announcementsRes) ? announcementsRes : (announcementsRes as any).content || [];
                const events = Array.isArray(eventsRes) ? eventsRes : (eventsRes as any).content || [];

                const mappedAnnouncements: NewsItem[] = announcements.map((a: any) => ({
                    id: a.id,
                    title: a.title,
                    description: a.content || a.summary,
                    type: 'ANNOUNCEMENT',
                    createdAt: a.publishedAt || a.createdAt,
                    category: a.category || 'Announcement',
                    imageUrl: this.formatImageUrl(a.imageUrl)
                }));

                const mappedEvents: NewsItem[] = events.map((e: any) => ({
                    id: e.id,
                    title: e.title,
                    description: e.description,
                    type: 'EVENT',
                    createdAt: e.createdAt || e.eventDate || new Date().toISOString(), // Fallback if createdAt doesn't exist
                    location: e.location,
                    eventDate: e.eventDate,
                    imageUrl: this.formatImageUrl(e.imageUrl)
                }));

                return [...mappedAnnouncements, ...mappedEvents]
                    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
            })
        ).subscribe({
            next: (mergedNews) => {
                this.news = mergedNews;
                this.filteredNews = this.news;
                this.loading = false;
                this.cdr.detectChanges();
            },
            error: (err) => {
                console.error('Error fetching news feed', err);
                this.loading = false;
            }
        });
    }

    setFilter(filter: string) {
        this.currentFilter = filter;
        if (filter === 'Latest') {
            this.filteredNews = this.news;
        } else if (filter === 'Videos') {
            this.filteredNews = this.news.filter(item => item.category?.toLowerCase() === 'video' || item.title.toLowerCase().includes('video'));
        } else if (filter === 'HR Updates') {
            this.filteredNews = this.news.filter(item => item.category?.toLowerCase() === 'hr' || item.title.toLowerCase().includes('hr') || item.title.toLowerCase().includes('policy'));
        } else if (filter === 'Tech News') {
            this.filteredNews = this.news.filter(item => item.category?.toLowerCase() === 'it' || item.title.toLowerCase().includes('tech') || item.title.toLowerCase().includes('it'));
        }
    }

    private formatImageUrl(url: string | null | undefined): string | undefined {
        if (!url) return undefined;
        if (url.startsWith('http') || url.startsWith('/api/') || url.startsWith('assets/')) {
            return url;
        }
        return '/api/files/' + url;
    }
}
