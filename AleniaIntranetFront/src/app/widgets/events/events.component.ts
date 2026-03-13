import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DashboardService } from '../../core/services/dashboard.service';
import { RouterModule } from '@angular/router';

interface UiEvent {
    month: string;
    day: string;
    title: string;
    time: string;
    location: string;
    type: string;
    daysUntil: string;
    eventDate: string;
}

@Component({
    selector: 'app-events',
    standalone: true,
    imports: [CommonModule, RouterModule],
    templateUrl: './events.component.html',
    styleUrl: './events.component.css'
})
export class EventsComponent {
    private dashboardService = inject(DashboardService);
    events = signal<UiEvent[]>([]);
    nextEvent = signal<{ title: string; daysUntil: number; eventDate: string } | null>(null);

    constructor() {
        this.dashboardService.getUpcomingEvents().subscribe(data => {
            const now = new Date();
            now.setHours(0, 0, 0, 0);

            const mapped = data.map(e => {
                const date = new Date(e.eventDate);
                const month = date.toLocaleString('default', { month: 'short' });
                const day = date.getDate().toString();
                const diffDays = Math.ceil((date.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
                let daysUntil = '';
                if (diffDays <= 0) daysUntil = 'Today';
                else if (diffDays === 1) daysUntil = 'Tomorrow';
                else daysUntil = `In ${diffDays} days`;

                return {
                    month,
                    day,
                    title: e.title,
                    time: e.eventTime.substring(0, 5),
                    location: e.location,
                    type: this.getRandomType(),
                    daysUntil,
                    eventDate: e.eventDate
                };
            });
            this.events.set(mapped);

            // Set next event countdown
            if (data.length > 0) {
                const first = data[0];
                const firstDate = new Date(first.eventDate);
                const diffDays = Math.ceil((firstDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
                this.nextEvent.set({
                    title: first.title,
                    daysUntil: Math.max(0, diffDays),
                    eventDate: first.eventDate
                });
            }
        });
    }

    getRandomType(): string {
        const types = ['indigo', 'orange', 'green', 'blue'];
        return types[Math.floor(Math.random() * types.length)];
    }

    getBadgeClass(event: any): string {
        const map: any = {
            indigo: 'bg-indigo-50 dark:bg-indigo-900/20',
            orange: 'bg-orange-50 dark:bg-orange-900/20',
            green: 'bg-green-50 dark:bg-green-900/20',
            blue: 'bg-blue-50 dark:bg-blue-900/20'
        };
        return map[event.type] || 'bg-gray-100';
    }

    getTextClass(event: any): string {
        const map: any = {
            indigo: 'text-indigo-600 dark:text-indigo-400',
            orange: 'text-orange-600 dark:text-orange-400',
            green: 'text-green-600 dark:text-green-400',
            blue: 'text-blue-600 dark:text-blue-400'
        };
        return map[event.type] || 'text-gray-600';
    }

    getNumberClass(event: any): string {
        const map: any = {
            indigo: 'text-indigo-800 dark:text-indigo-300',
            orange: 'text-orange-800 dark:text-orange-300',
            green: 'text-green-800 dark:text-green-300',
            blue: 'text-blue-800 dark:text-blue-300'
        };
        return map[event.type] || 'text-gray-800';
    }
}

