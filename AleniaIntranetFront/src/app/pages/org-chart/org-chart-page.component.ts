import { Component, OnInit, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { OrgNode } from '../../core/models/org-chart.model';
import { ORG_CHART_DATA, DEPARTMENTS, DEPARTMENT_BADGE } from './org-chart-data';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

@Component({
    selector: 'app-org-chart-page',
    standalone: true,
    imports: [CommonModule, RouterModule, FormsModule],
    templateUrl: './org-chart-page.component.html',
    styleUrls: ['./org-chart-page.component.css']
})
export class OrgChartPageComponent implements OnInit {

    // Data
    orgTree!: OrgNode;
    filteredTree: OrgNode | null = null;
    departments = DEPARTMENTS;

    // State
    searchQuery = '';
    activeDepartment = 'All Departments';
    isLoading = true;
    expandedNodes = new Set<string>();

    // Employee Details Panel
    selectedEmployee: OrgNode | null = null;
    private parentMap = new Map<string, OrgNode>();

    // Zoom & Pan
    zoom = 1.0;
    panX = 0;
    panY = 0;
    isPanning = false;
    startX = 0;
    startY = 0;

    ngOnInit(): void {
        setTimeout(() => {
            this.orgTree = ORG_CHART_DATA;
            this.buildParentMap(this.orgTree, null);
            // By default, expand root and first talent manager branch
            this.expandedNodes.add('cd-1');
            this.expandedNodes.add('tm-michel');
            this.applyFilters();
            this.isLoading = false;
        }, 400);
    }

    // --- Parent Map (for manager lookup) ---

    private buildParentMap(node: OrgNode, parent: OrgNode | null): void {
        if (parent) {
            this.parentMap.set(node.id, parent);
        }
        for (const child of node.children) {
            this.buildParentMap(child, node);
        }
    }

    // --- Employee Details Panel ---

    openEmployeeDetails(node: OrgNode, event?: MouseEvent): void {
        if (event) event.stopPropagation();
        this.selectedEmployee = node;
    }

    closeEmployeeDetails(): void {
        this.selectedEmployee = null;
    }

    getManagerOf(node: OrgNode): OrgNode | null {
        return this.parentMap.get(node.id) || null;
    }

    navigateToManager(manager: OrgNode): void {
        this.selectedEmployee = manager;
    }

    // --- Expand/Collapse ---

    isExpanded(nodeId: string): boolean {
        return this.expandedNodes.has(nodeId);
    }

    toggleExpand(nodeId: string, event?: MouseEvent): void {
        if (event) event.stopPropagation();
        if (this.expandedNodes.has(nodeId)) {
            this.expandedNodes.delete(nodeId);
        } else {
            this.expandedNodes.add(nodeId);
        }
    }

    // --- Zoom Controls ---

    zoomIn(): void {
        this.zoom = Math.min(2.0, +(this.zoom + 0.1).toFixed(1));
    }

    zoomOut(): void {
        this.zoom = Math.max(0.3, +(this.zoom - 0.1).toFixed(1));
    }

    resetView(): void {
        this.zoom = 1.0;
        this.panX = 0;
        this.panY = 0;
    }

    get transformStyle(): string {
        return `translate(${this.panX}px, ${this.panY}px) scale(${this.zoom})`;
    }

    // --- Canvas Drag ---

    onMouseDown(event: MouseEvent): void {
        if (event.button !== 0) return;
        this.isPanning = true;
        this.startX = event.clientX - this.panX;
        this.startY = event.clientY - this.panY;
    }

    @HostListener('document:mousemove', ['$event'])
    onMouseMove(event: MouseEvent): void {
        if (!this.isPanning) return;
        event.preventDefault();
        this.panX = event.clientX - this.startX;
        this.panY = event.clientY - this.startY;
    }

    @HostListener('document:mouseup')
    onMouseUp(): void {
        this.isPanning = false;
    }

    // --- Search & Filters ---

    onSearchChange(): void {
        this.applyFilters();
    }

    selectDepartment(dept: string): void {
        this.activeDepartment = dept;
        this.applyFilters();
    }

    applyFilters(): void {
        if (!this.orgTree) {
            this.filteredTree = null;
            return;
        }
        const query = this.searchQuery.trim().toLowerCase();
        const dept = this.activeDepartment;
        this.filteredTree = this.filterNode(this.orgTree, query, dept);
    }

    private filterNode(node: OrgNode, query: string, dept: string): OrgNode | null {
        const matchesQuery = !query ||
            node.fullName.toLowerCase().includes(query) ||
            node.title.toLowerCase().includes(query) ||
            node.department.toLowerCase().includes(query);

        const matchesDept = dept === 'All Departments' || node.department === dept;

        const filteredChildren = node.children
            .map(child => this.filterNode(child, query, dept))
            .filter((child): child is OrgNode => child !== null);

        if ((matchesQuery && matchesDept) || filteredChildren.length > 0) {
            return { ...node, children: filteredChildren };
        }
        return null;
    }

    get hasResults(): boolean {
        return this.filteredTree !== null;
    }

    // --- Department Badge Styling ---

    getBadgeClasses(department: string): string {
        const badge = DEPARTMENT_BADGE[department];
        if (!badge) return 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300';
        return `${badge.bg} ${badge.text}`;
    }

    // --- Export ---

    exportPdf(): void {
        const element = document.getElementById('zoom-container');
        if (!element) return;

        // Temporarily reset transform to capture the whole chart correctly
        const originalTransform = element.style.transform;
        element.style.transform = 'none';

        html2canvas(element, {
            scale: 2, // High resolution
            useCORS: true,
            backgroundColor: '#f8f9fa' // Match background
        }).then(canvas => {
            // Restore transform
            element.style.transform = originalTransform;

            const imgData = canvas.toDataURL('image/png');
            const pdf = new jsPDF('l', 'mm', 'a4'); // Landscape A4

            const pdfWidth = pdf.internal.pageSize.getWidth();
            const pdfHeight = (canvas.height * pdfWidth) / canvas.width;

            // If the height is greater than A4 height, we might need multiple pages, 
            // but for simplicity we'll just draw it scaled to width.
            pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
            pdf.save('Alenia-IBERIA-Org-Chart.pdf');
        }).catch(err => {
            element.style.transform = originalTransform;
            console.error('Error exporting PDF', err);
        });
    }

    printChart(): void {
        window.print();
    }

    // --- Helpers ---

    get zoomPercent(): number {
        return Math.round(this.zoom * 100);
    }
}
