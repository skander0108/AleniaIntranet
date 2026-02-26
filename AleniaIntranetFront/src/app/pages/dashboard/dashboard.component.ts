import { Component, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { DashboardService, Tool, Announcement } from '../../core/services/dashboard.service';
import { SearchService } from '../../core/services/search';
import { ExternalHubsComponent } from '../../widgets/external-hubs/external-hubs.component';
import { NewJoinersComponent } from '../../widgets/new-joiners/new-joiners.component';
import { EventsComponent } from '../../widgets/events/events.component';

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
        ExternalHubsComponent,
        NewJoinersComponent,
        EventsComponent
    ],
    templateUrl: './dashboard.component.html',
    styleUrl: './dashboard.component.css'
})
export class DashboardComponent {
    private dashboardService = inject(DashboardService);
    private router = inject(Router);
    private searchService = inject(SearchService);

    tools = signal<Tool[]>([]);
    feed = signal<UiAnnouncement[]>([]);
    featuredNews = signal<Announcement | null>(null);

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
        if (!query) return this.feed();
        return this.feed().filter(f =>
            f.title.toLowerCase().includes(query) ||
            (f.description && f.description.toLowerCase().includes(query)) ||
            (f.category && f.category.toLowerCase().includes(query))
        );
    });

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
        this.dashboardService.getTools().subscribe(data => {
            const kbTool: Tool = {
                id: 'kb',
                name: 'Knowledge Base',
                url: '/knowledge-base',
                icon: 'menu_book',
                colorTheme: 'blue',
                description: 'Guides & Policies'
            };

            const itTool: Tool = {
                id: 'it',
                name: 'IT Support',
                url: '/it-support/my',
                icon: 'support_agent',
                colorTheme: 'purple',
                description: 'Tech Help'
            };

            const leaveTool: Tool = {
                id: 'leave',
                name: 'Leave',
                url: '/leave',
                icon: 'event_busy',
                colorTheme: 'orange',
                description: 'Time Off'
            };

            const lmsTool: Tool = {
                id: 'lms',
                name: 'My Progress',
                url: '/lms/my-progress',
                icon: 'school',
                colorTheme: 'green',
                description: 'Training'
            };

            const expenseTool: Tool = {
                id: 'expenses',
                name: 'Travel & Expenses',
                url: '/expenses/my',
                icon: 'receipt_long',
                colorTheme: 'blue',
                description: 'Expense Reports'
            };

            this.tools.set([...data, kbTool, itTool, leaveTool, lmsTool, expenseTool]);
        });
        this.dashboardService.getNewsFeed().subscribe(data => {
            this.feed.set(data.map(a => ({
                ...a,
                description: a.summary || '',
                time: new Date(a.publishedAt).toLocaleDateString(),
                badge: a.category || 'News',
                type: 'info',
                icon: 'article',
                image: this.formatImageUrl(a.imageUrl)
            } as UiAnnouncement)));
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
            info: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300',
            warning: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300',
            success: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300'
        };
        return map[type] || 'bg-gray-100 text-gray-800';
    }

    openTool(tool: Tool) {
        if (tool.url.startsWith('http')) {
            window.open(tool.url, '_blank');
        } else {
            this.router.navigate([tool.url]);
        }
    }
}
