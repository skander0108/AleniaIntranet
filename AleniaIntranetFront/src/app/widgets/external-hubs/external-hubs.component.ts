import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { QuickLink } from '../../core/services/dashboard.service';

@Component({
    selector: 'app-external-hubs',
    standalone: true,
    imports: [CommonModule],
    templateUrl: './external-hubs.component.html',
    styleUrl: './external-hubs.component.css'
})
export class ExternalHubsComponent {
    hubs = signal<QuickLink[]>([
        { id: '1', label: 'Boondmanager', url: 'https://ui.boondmanager.com', isActive: true, description: 'ERP Management', icon: 'work' },
        { id: '2', label: 'Alenia Academy', url: 'https://aleniaprodacademy.ispring.eu/', isActive: true, description: 'Learning Platform', icon: 'school' },
        { id: '3', label: 'Alenia Pulse', url: '#', isActive: true, description: 'Internal Network', icon: 'hub' },
        { id: '4', label: 'Talentia', url: 'https://www.talentia-software.com', isActive: true, description: 'HR & Financial', icon: 'people' }
    ]);

    getThemeClass(hub: any): string {
        const key = this.getCategoryKey(hub);
        const map: any = {
            indigo: 'bg-gradient-to-r from-indigo-500/10 to-purple-500/10 border-indigo-100 dark:border-indigo-900/30',
            blue: 'bg-gradient-to-r from-blue-500/10 to-cyan-500/10 border-blue-100 dark:border-blue-900/30',
            teal: 'bg-gradient-to-r from-teal-500/10 to-emerald-500/10 border-teal-100 dark:border-teal-900/30'
        };
        return map[key] || map['blue'];
    }

    getIconBgClass(hub: any): string {
        const key = this.getCategoryKey(hub);
        const map: any = {
            indigo: 'bg-gradient-to-br from-indigo-500 to-purple-600',
            blue: 'bg-gradient-to-br from-blue-500 to-cyan-600',
            teal: 'bg-gradient-to-br from-teal-500 to-emerald-600'
        };
        return map[key] || 'bg-gray-500';
    }

    private getCategoryKey(hub: any): string {
        if (hub.label?.toLowerCase().includes('alenia academy')) return 'indigo';
        if (hub.label?.toLowerCase().includes('boondmanager')) return 'teal';
        if (hub.label?.toLowerCase().includes('alenia pulse')) return 'blue';
        return hub.category || 'blue';
    }
}
