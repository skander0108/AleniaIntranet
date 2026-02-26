import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule, Router } from '@angular/router';
import { AdminItSupportService, TicketFilters } from '../../../core/services/admin-it-support.service';
import { ItSupportService } from '../../../core/services/it-support.service';
import {
    ItSupportTicketDto,
    TicketStatus,
    TicketPriority,
    TicketCategory
} from '../../../core/models/it-support.model';

@Component({
    selector: 'app-admin-support-portal',
    standalone: true,
    imports: [CommonModule, FormsModule, RouterModule],
    templateUrl: './admin-support-portal.component.html',
    styleUrl: './admin-support-portal.component.css'
})
export class AdminSupportPortalComponent implements OnInit {
    // Enums for template
    TicketStatus = TicketStatus;
    TicketPriority = TicketPriority;
    TicketCategory = TicketCategory;

    // Math for template
    Math = Math;

    // Loading states
    loadingRecent = false;
    loadingAll = false;

    // Data
    recentTickets: ItSupportTicketDto[] = [];
    allTickets: ItSupportTicketDto[] = [];

    // Pagination
    currentPage = 0;
    pageSize = 20;
    totalPages = 0;
    totalElements = 0;

    // Filters
    filters: TicketFilters = {};
    searchQuery = '';

    constructor(
        private adminItSupportService: AdminItSupportService,
        private itSupportService: ItSupportService,
        private router: Router,
        private cdr: ChangeDetectorRef
    ) { }

    ngOnInit() {
        this.loadRecentTickets();
        this.loadAllTickets();
    }

    loadRecentTickets() {
        this.loadingRecent = true;
        this.itSupportService.getMyTickets(0, 5).subscribe({
            next: (response) => {
                this.recentTickets = response.content;
                this.loadingRecent = false;
                this.cdr.markForCheck();
            },
            error: (err) => {
                console.error('Error loading recent tickets:', err);
                this.loadingRecent = false;
                this.cdr.markForCheck();
            }
        });
    }

    loadAllTickets() {
        this.loadingAll = true;
        this.adminItSupportService.getAllTickets(this.filters, this.currentPage, this.pageSize).subscribe({
            next: (response) => {
                this.allTickets = response.content;
                this.totalPages = response.totalPages;
                this.totalElements = response.totalElements;
                this.loadingAll = false;
                this.cdr.markForCheck();
            },
            error: (err) => {
                console.error('Error loading all tickets:', err);
                this.loadingAll = false;
                this.cdr.markForCheck();
            }
        });
    }

    applyFilters() {
        if (this.searchQuery.trim()) {
            this.filters.q = this.searchQuery.trim();
        } else {
            delete this.filters.q;
        }
        this.currentPage = 0;
        this.loadAllTickets();
    }

    clearFilters() {
        this.filters = {};
        this.searchQuery = '';
        this.currentPage = 0;
        this.loadAllTickets();
    }

    changePage(newPage: number) {
        if (newPage >= 0 && newPage < this.totalPages) {
            this.currentPage = newPage;
            this.loadAllTickets();
        }
    }

    viewTicket(ticketId: string) {
        this.router.navigate(['/admin/it-support', ticketId]);
    }

    // Helper methods for CSS classes
    getStatusClass(status: TicketStatus): string {
        const classes: Record<TicketStatus, string> = {
            [TicketStatus.OPEN]: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300',
            [TicketStatus.IN_PROGRESS]: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300',
            [TicketStatus.WAITING_USER]: 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300',
            [TicketStatus.RESOLVED]: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300',
            [TicketStatus.CLOSED]: 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300'
        };
        return classes[status] || '';
    }

    getPriorityClass(priority: TicketPriority): string {
        const classes: Record<TicketPriority, string> = {
            [TicketPriority.LOW]: 'bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-300',
            [TicketPriority.MEDIUM]: 'bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-300',
            [TicketPriority.HIGH]: 'bg-orange-100 text-orange-600 dark:bg-orange-900/30 dark:text-orange-300',
            [TicketPriority.URGENT]: 'bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-300'
        };
        return classes[priority] || '';
    }

    getCategoryIcon(category: TicketCategory): string {
        const icons: Record<TicketCategory, string> = {
            [TicketCategory.HARDWARE]: 'computer',
            [TicketCategory.SOFTWARE]: 'apps',
            [TicketCategory.NETWORK]: 'wifi',
            [TicketCategory.ACCESS]: 'key',
            [TicketCategory.EMAIL]: 'mail',
            [TicketCategory.FACILITIES]: 'home_repair_service',
            [TicketCategory.OTHER]: 'help'
        };
        return icons[category] || 'help';
    }
}
