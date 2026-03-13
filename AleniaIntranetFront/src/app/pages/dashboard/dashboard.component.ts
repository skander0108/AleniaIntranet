import { Component, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { forkJoin } from 'rxjs';
import { DashboardService, Tool, Announcement, Event } from '../../core/services/dashboard.service';
import { SearchService } from '../../core/services/search';
import { AuthService } from '../../core/services/auth.service';
import { ExternalHubsComponent } from '../../widgets/external-hubs/external-hubs.component';
import { NewJoinersComponent } from '../../widgets/new-joiners/new-joiners.component';
import { EventsComponent } from '../../widgets/events/events.component';
import { RecentDocumentsComponent } from '../../widgets/recent-documents/recent-documents.component';

interface UiAnnouncement extends Announcement {
    description: string;
    time: string;
    badge: string;
    type: string;
    icon?: string;
    iconBg?: string;
    iconColor?: string;
    image?: string;
}

@Component({
    selector: 'app-dashboard',
    standalone: true,
    imports: [
        CommonModule,
        RouterModule,
        ExternalHubsComponent,
        NewJoinersComponent,
        EventsComponent,
        RecentDocumentsComponent
    ],
    templateUrl: './dashboard.component.html',
    styleUrl: './dashboard.component.css'
})
export class DashboardComponent {
    private dashboardService = inject(DashboardService);
    private router = inject(Router);
    private searchService = inject(SearchService);
    private authService = inject(AuthService);

    tools = signal<Tool[]>([]);
    feed = signal<UiAnnouncement[]>([]);
    featuredNews = signal<Announcement | null>(null);
    greeting = signal<string>('Welcome');
    userName = signal<string>('');
    visibleFeedCount = signal<number>(5);

    filteredTools = computed(() => {
        const query = this.searchService.searchQuery().toLowerCase();
        if (!query) return this.tools();
        return this.tools().filter(t =>
            t.name.toLowerCase().includes(query) ||
            (t.description && t.description.toLowerCase().includes(query))
        );
    });

    filteredFeed = computed(() => {
        const query = this.searchService.searchQuery().toLowerCase();
        let items = this.feed();
        if (query) {
            items = items.filter(f =>
                f.title.toLowerCase().includes(query) ||
                (f.description && f.description.toLowerCase().includes(query)) ||
                (f.category && f.category.toLowerCase().includes(query))
            );
        }
        return items.slice(0, this.visibleFeedCount());
    });

    loadMoreFeed() {
        this.visibleFeedCount.update(v => v + 5);
    }

    // Computed or derived state for the Hero section
    get heroNews(): Announcement | null {
        const featured = this.featuredNews();
        if (featured) return featured;

        const feedItems = this.feed();
        if (feedItems.length > 0) {
            // Convert UiAnnouncement back to Announcement-like structure for the hero
            const first = feedItems[0];
            return {
                id: first.id,
                title: first.title,
                content: first.content,
                publishedAt: first.publishedAt,
                status: first.status,
                summary: first.summary,
                imageUrl: first.image, // Use the image property from UI model
                category: first.category,
                isFeatured: false
            };
        }
        return null;
    }

    constructor() {
        // Time-based greeting
        const hour = new Date().getHours();
        if (hour < 12) this.greeting.set('Good morning');
        else if (hour < 18) this.greeting.set('Good afternoon');
        else this.greeting.set('Good evening');

        const user = this.authService.getCurrentUser();
        if (user) {
            this.userName.set(user.fullName.split(' ')[0]);
        }

        this.tools.set([
            {
                id: 'docs',
                name: 'Documents',
                url: '/documents',
                icon: 'folder_open',
                colorTheme: 'blue',
                description: 'Files & Policies'
            },
            {
                id: 'lms',
                name: 'My Learning',
                url: '/lms/my-progress',
                icon: 'school',
                colorTheme: 'green',
                description: 'Training'
            },
            {
                id: 'teams',
                name: 'Teams',
                url: 'https://teams.microsoft.com',
                icon: 'groups',
                colorTheme: 'purple',
                description: 'Chat & Meetings'
            },
            {
                id: 'excel',
                name: 'Excel',
                url: 'https://www.office.com/launch/excel',
                icon: 'table_view',
                colorTheme: 'green',
                description: 'Spreadsheets'
            },
            {
                id: 'word',
                name: 'Word',
                url: 'https://www.office.com/launch/word',
                icon: 'description',
                colorTheme: 'blue',
                description: 'Documents'
            }
        ]);
        forkJoin({
            announcements: this.dashboardService.getNewsFeed(),
            events: this.dashboardService.getUpcomingEvents()
        }).subscribe(({ announcements, events }) => {
            const announcementItems: UiAnnouncement[] = announcements.map(a => ({
                ...a,
                description: a.summary || '',
                time: this.getRelativeTime(a.publishedAt),
                badge: a.category || 'News',
                type: a.category?.toLowerCase() || 'news',
                icon: this.getCategoryIcon(a.category),
                image: this.formatImageUrl(a.imageUrl)
            } as UiAnnouncement));

            const eventItems: UiAnnouncement[] = events.map(e => ({
                id: e.id,
                title: e.title,
                content: '',
                publishedAt: e.eventDate + 'T' + (e.eventTime || '00:00'),
                status: 'PUBLISHED',
                summary: (e.location ? '📍 ' + e.location + ' — ' : '') + e.eventDate,
                description: (e.location ? '📍 ' + e.location + ' — ' : '') + e.eventDate,
                time: this.getRelativeTime(e.eventDate + 'T' + (e.eventTime || '00:00')),
                badge: 'Events',
                type: 'events',
                icon: 'event',
                image: this.formatImageUrl(e.imageUrl)
            } as UiAnnouncement));

            const merged = [...announcementItems, ...eventItems]
                .sort((a, b) => new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime());
            this.feed.set(merged);
        });
        this.dashboardService.getFeaturedNews().subscribe({
            next: (data) => {
                if (data) {
                    data.imageUrl = this.formatImageUrl(data.imageUrl);
                }
                this.featuredNews.set(data);
            },
            error: () => this.featuredNews.set(null)
        });
    }

    private formatImageUrl(url: string | null | undefined): string | undefined {
        if (!url) return undefined;
        if (url.startsWith('http') || url.startsWith('/api/') || url.startsWith('assets/')) {
            return url;
        }
        return '/api/files/' + url;
    }

    getToolBgClass(tool: any): string {
        const map: any = {
            blue: 'bg-blue-50 dark:bg-blue-900/30 group-hover:bg-blue-100 dark:group-hover:bg-blue-900/50',
            purple: 'bg-purple-50 dark:bg-purple-900/30 group-hover:bg-purple-100 dark:group-hover:bg-purple-900/50',
            green: 'bg-green-50 dark:bg-green-900/30 group-hover:bg-green-100 dark:group-hover:bg-green-900/50',
            orange: 'bg-orange-50 dark:bg-orange-900/30 group-hover:bg-orange-100 dark:group-hover:bg-orange-900/50'
        };
        return map[tool.colorTheme] || map['blue'];
    }

    getToolIconClass(tool: any): string {
        const map: any = {
            blue: 'text-blue-600 dark:text-blue-400',
            purple: 'text-purple-600 dark:text-purple-400',
            green: 'text-green-600 dark:text-green-400',
            orange: 'text-orange-600 dark:text-orange-400'
        };
        return map[tool.colorTheme] || map['blue'];
    }

    getBadgeClass(type: string): string {
        const map: any = {
            hr: 'bg-purple-100 text-purple-800 dark:bg-purple-900/40 dark:text-purple-300',
            it: 'bg-cyan-100 text-cyan-800 dark:bg-cyan-900/40 dark:text-cyan-300',
            news: 'bg-blue-100 text-blue-800 dark:bg-blue-900/40 dark:text-blue-300',
            policy: 'bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-300',
            events: 'bg-green-100 text-green-800 dark:bg-green-900/40 dark:text-green-300',
            info: 'bg-blue-100 text-blue-800 dark:bg-blue-900/40 dark:text-blue-300',
            warning: 'bg-red-100 text-red-800 dark:bg-red-900/40 dark:text-red-300',
            success: 'bg-green-100 text-green-800 dark:bg-green-900/40 dark:text-green-300'
        };
        return map[type] || 'bg-blue-100 text-blue-800 dark:bg-blue-900/40 dark:text-blue-300';
    }

    getCategoryIcon(category?: string): string {
        const cat = (category || '').toLowerCase();
        const map: any = {
            hr: 'groups',
            it: 'dns',
            news: 'campaign',
            policy: 'gavel',
            events: 'event',
            training: 'school',
            finance: 'account_balance'
        };
        return map[cat] || 'article';
    }

    getCategoryIconBg(category?: string): string {
        const cat = (category || '').toLowerCase();
        const map: any = {
            hr: 'bg-purple-50 dark:bg-purple-900/20 text-purple-600 dark:text-purple-400',
            it: 'bg-cyan-50 dark:bg-cyan-900/20 text-cyan-600 dark:text-cyan-400',
            news: 'bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400',
            policy: 'bg-amber-50 dark:bg-amber-900/20 text-amber-600 dark:text-amber-400',
            events: 'bg-green-50 dark:bg-green-900/20 text-green-600 dark:text-green-400',
            training: 'bg-green-50 dark:bg-green-900/20 text-green-600 dark:text-green-400',
            finance: 'bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 dark:text-emerald-400'
        };
        return map[cat] || 'bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400';
    }

    getBorderAccentClass(category?: string): string {
        const cat = (category || '').toLowerCase();
        const map: any = {
            hr: 'border-l-purple-500',
            it: 'border-l-cyan-500',
            news: 'border-l-blue-500',
            policy: 'border-l-amber-500',
            events: 'border-l-green-500',
            training: 'border-l-green-500',
            finance: 'border-l-emerald-500'
        };
        return map[cat] || 'border-l-blue-500';
    }

    getRelativeTime(dateStr: string): string {
        const now = new Date();
        const date = new Date(dateStr);
        const diffMs = now.getTime() - date.getTime();
        const diffMin = Math.floor(diffMs / 60000);
        const diffHr = Math.floor(diffMs / 3600000);
        const diffDay = Math.floor(diffMs / 86400000);

        if (diffMin < 1) return 'Just now';
        if (diffMin < 60) return `${diffMin}m ago`;
        if (diffHr < 24) return `${diffHr}h ago`;
        if (diffDay === 1) return 'Yesterday';
        if (diffDay < 7) return `${diffDay}d ago`;
        if (diffDay < 30) return `${Math.floor(diffDay / 7)}w ago`;
        return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    }

    openTool(tool: Tool) {
        if (tool.url.startsWith('http')) {
            window.open(tool.url, '_blank');
        } else {
            this.router.navigate([tool.url]);
        }
    }
}
