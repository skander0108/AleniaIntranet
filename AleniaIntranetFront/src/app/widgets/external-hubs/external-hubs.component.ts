import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DashboardService, QuickLink } from '../../core/services/dashboard.service';

@Component({
    selector: 'app-external-hubs',
    standalone: true,
    imports: [CommonModule],
    templateUrl: './external-hubs.component.html',
    styleUrl: './external-hubs.component.css'
})
export class ExternalHubsComponent {
    private dashboardService = inject(DashboardService);
    hubs = signal<QuickLink[]>([]);

    constructor() {
        this.dashboardService.getExternalHubs().subscribe(data => {
            this.hubs.set(data);
        });
    }

    getThemeClass(hub: any): string {
        const key = this.getCategoryKey(hub);
        const map: any = {
            pink: 'bg-gradient-to-r from-pink-500/10 to-purple-500/10 border-pink-100 dark:border-pink-900/30',
            blue: 'bg-gradient-to-r from-blue-500/10 to-cyan-500/10 border-blue-100 dark:border-blue-900/30',
            teal: 'bg-gradient-to-r from-teal-500/10 to-emerald-500/10 border-teal-100 dark:border-teal-900/30'
        };
        return map[key] || map['blue'];
    }

    getIconBgClass(hub: any): string {
        const key = this.getCategoryKey(hub);
        const map: any = {
            pink: 'bg-gradient-to-br from-pink-500 to-purple-600',
            blue: 'bg-gradient-to-br from-blue-500 to-cyan-600',
            teal: 'bg-gradient-to-br from-teal-500 to-emerald-600'
        };
        return map[key] || 'bg-gray-500';
    }

    private getCategoryKey(hub: any): string {
        if (hub.label?.toLowerCase().includes('talentia')) return 'pink';
        if (hub.label?.toLowerCase().includes('boondmanager')) return 'teal';
        if (hub.label?.toLowerCase().includes('alenia pulse')) return 'blue';
        return hub.category || 'blue';
    }
}
