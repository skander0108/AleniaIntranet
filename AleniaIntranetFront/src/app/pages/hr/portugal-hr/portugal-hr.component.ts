import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HrService, HrCountryData } from '../../../core/services/hr.service';

@Component({
    selector: 'app-portugal-hr',
    standalone: true,
    imports: [CommonModule, FormsModule],
    templateUrl: './portugal-hr.component.html',
    styleUrl: './portugal-hr.component.css'
})
export class PortugalHrComponent implements OnInit {
    hrData: HrCountryData | null = null;
    searchQuery = '';
    expandedSections: Set<string> = new Set();

    constructor(private hrService: HrService) { }

    ngOnInit(): void {
        this.hrService.getPortugalData().subscribe({
            next: (data) => {
                this.hrData = data;
                // Expand first section by default
                if (data.sections.length > 0) {
                    this.expandedSections.add(data.sections[0].id);
                }
            },
            error: () => {
                console.error('Failed to load Portugal HR data');
            }
        });
    }

    toggleSection(id: string): void {
        if (this.expandedSections.has(id)) {
            this.expandedSections.delete(id);
        } else {
            this.expandedSections.add(id);
        }
    }

    isSectionExpanded(id: string): boolean {
        return this.expandedSections.has(id);
    }

    get filteredSections() {
        if (!this.hrData) return [];
        if (!this.searchQuery.trim()) return this.hrData.sections;
        const q = this.searchQuery.toLowerCase();
        return this.hrData.sections.filter(s =>
            s.title.toLowerCase().includes(q) ||
            JSON.stringify(s.content).toLowerCase().includes(q)
        );
    }

    expandAll(): void {
        this.filteredSections.forEach(s => this.expandedSections.add(s.id));
    }

    collapseAll(): void {
        this.expandedSections.clear();
    }
}
