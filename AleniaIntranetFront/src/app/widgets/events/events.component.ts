import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DashboardService } from '../../core/services/dashboard.service';

interface UiEvent {
    month: string;
    day: string;
    title: string;
    time: string;
    location: string;
    type: string;
}

import { RouterModule } from '@angular/router';

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

    constructor() {
        this.dashboardService.getUpcomingEvents().subscribe(data => {
            // Map backend data to UI format if needed, or use as is if compatible
            // backend Event has: id, title, eventDate, eventTime, location
            // UI expects: month, day, title, time, location, type
            this.events.set(data.map(e => {
                const date = new Date(e.eventDate);
                const month = date.toLocaleString('default', { month: 'short' });
                const day = date.getDate().toString();
                return {
                    month,
                    day,
                    title: e.title,
                    time: e.eventTime.substring(0, 5), // 'HH:mm'
                    location: e.location,
                    type: this.getRandomType() // Backend doesn't store color type yet
                };
            }));
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
