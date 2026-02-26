import { Component, OnInit, ChangeDetectorRef, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { ReactiveFormsModule, FormControl } from '@angular/forms';
import { AdminItSupportService } from '../../../../core/services/admin-it-support.service';
import {
  ItSupportTicketDto,
  PageResponse,
  TicketStatus,
  TicketPriority,
  TicketCategory,
  ItSupportMetricsDto
} from '../../../../core/models/it-support.model';

@Component({
  selector: 'app-admin-tickets-list',
  standalone: true,
  imports: [CommonModule, RouterModule, ReactiveFormsModule],
  template: `
    <div class="min-h-screen bg-gray-50 py-8 px-4 sm:px-6 lg:px-8">
      <div class="max-w-7xl mx-auto">
        <h1 class="text-2xl font-bold text-gray-900 mb-6">IT Support Requests</h1>

        <!-- Metrics Dashboard -->
        <div *ngIf="metrics" class="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <div class="bg-white p-4 rounded-lg shadow-sm border-l-4 border-blue-500">
            <p class="text-sm text-gray-500">Total Tickets</p>
            <p class="text-2xl font-bold text-gray-900">{{ metrics.totalTickets }}</p>
          </div>
          <div class="bg-white p-4 rounded-lg shadow-sm border-l-4 border-yellow-500">
            <p class="text-sm text-gray-500">Open Tickets</p>
            <p class="text-2xl font-bold text-gray-900">{{ metrics.openTickets }}</p>
          </div>
          <div class="bg-white p-4 rounded-lg shadow-sm border-l-4 border-green-500">
            <p class="text-sm text-gray-500">Resolved Tickets</p>
            <p class="text-2xl font-bold text-gray-900">{{ metrics.resolvedTickets }}</p>
          </div>
          <div class="bg-white p-4 rounded-lg shadow-sm border-l-4 border-purple-500">
             <p class="text-sm text-gray-500">Avg Resolution Time</p>
             <p class="text-2xl font-bold text-gray-900">{{ metrics.avgResolutionTimeHours | number:'1.0-1' }}h</p>
          </div>
        </div>

        <!-- Filters -->
        <div class="bg-white p-4 rounded-lg shadow-sm mb-6">
          <div class="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">Status</label>
              <select
                [formControl]="statusFilter"
                (change)="applyFilters()"
                class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">All</option>
                <option *ngFor="let status of statuses" [value]="status">{{ status.replace('_', ' ') }}</option>
              </select>
            </div>

            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">Priority</label>
              <select
                [formControl]="priorityFilter"
                (change)="applyFilters()"
                class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">All</option>
                <option *ngFor="let priority of priorities" [value]="priority">{{ priority }}</option>
              </select>
            </div>

            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">Category</label>
              <select
                [formControl]="categoryFilter"
                (change)="applyFilters()"
                class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">All</option>
                <option *ngFor="let category of categories" [value]="category">{{ category }}</option>
              </select>
            </div>

            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">Search</label>
              <input
                type="text"
                [formControl]="searchControl"
                (keyup.enter)="applyFilters()"
                placeholder="Search tickets..."
                class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          <div class="mt-3 flex justify-end">
            <button
              (click)="clearFilters()"
              class="px-4 py-2 text-sm text-gray-700 hover:text-gray-900"
            >
              Clear Filters
            </button>
          </div>
        </div>

        <!-- Tickets Table -->
        <div class="bg-white shadow-sm rounded-lg overflow-hidden">
          <div *ngIf="loading" class="p-8 text-center">
            <p class="text-gray-500">Loading tickets...</p>
          </div>

          <div *ngIf="!loading && tickets.length === 0" class="p-8 text-center">
            <p class="text-gray-500">No tickets found matching your criteria.</p>
          </div>

          <div *ngIf="!loading && tickets.length > 0">
            <table class="min-w-full divide-y divide-gray-200">
              <thead class="bg-gray-50">
                <tr>
                  <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Ticket #</th>
                  <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Title</th>
                  <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Requester</th>
                  <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Category</th>
                  <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Priority</th>
                  <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                  <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Assigned To</th>
                  <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Created</th>
                </tr>
              </thead>
              <tbody class="bg-white divide-y divide-gray-200">
                <tr
                  *ngFor="let ticket of tickets"
                  (click)="viewTicket(ticket.id)"
                  class="hover:bg-gray-50 cursor-pointer"
                >
                  <td class="px-6 py-4 whitespace-nowrap text-sm font-medium text-blue-600">
                    {{ ticket.ticketNumber }}
                  </td>
                  <td class="px-6 py-4 text-sm text-gray-900">{{ ticket.title }}</td>
                  <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {{ ticket.requesterName }}
                  </td>
                  <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {{ ticket.category }}
                  </td>
                  <td class="px-6 py-4 whitespace-nowrap">
                    <span [class]="getPriorityClass(ticket.priority)">
                      {{ ticket.priority }}
                    </span>
                  </td>
                  <td class="px-6 py-4 whitespace-nowrap">
                    <span [class]="getStatusClass(ticket.status)">
                      {{ ticket.status.replace('_', ' ') }}
                    </span>
                  </td>
                  <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {{ ticket.assignedToName || 'Unassigned' }}
                  </td>
                  <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {{ ticket.createdAt | date:'short' }}
                  </td>
                </tr>
              </tbody>
            </table>

            <!-- Pagination -->
            <div class="bg-white px-4 py-3 border-t border-gray-200 sm:px-6">
              <div class="flex items-center justify-between">
                <div class="text-sm text-gray-700">
                  Showing {{ (currentPage * pageSize) + 1 }} to 
                  {{ Math.min((currentPage + 1) * pageSize, totalElements) }} of 
                  {{ totalElements }} results
                </div>
                <div class="flex space-x-2">
                  <button
                    (click)="previousPage()"
                    [disabled]="currentPage === 0"
                    class="px-3 py-1 border rounded-md disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Previous
                  </button>
                  <button
                    (click)="nextPage()"
                    [disabled]="currentPage >= totalPages - 1"
                    class="px-3 py-1 border rounded-md disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Next
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  `
})
export class AdminTicketsListComponent implements OnInit {
  tickets: ItSupportTicketDto[] = [];
  metrics: ItSupportMetricsDto | null = null;
  loading = false;
  currentPage = 0;
  pageSize = 20;
  totalElements = 0;
  totalPages = 0;
  Math = Math;

  statuses = Object.values(TicketStatus);
  priorities = Object.values(TicketPriority);
  categories = Object.values(TicketCategory);

  statusFilter = new FormControl('');
  priorityFilter = new FormControl('');
  categoryFilter = new FormControl('');
  searchControl = new FormControl('');

  private cdr = inject(ChangeDetectorRef);

  constructor(
    private adminService: AdminItSupportService,
    private router: Router
  ) { }

  ngOnInit() {
    console.log('AdminTicketsListComponent initialized');
    this.loadTickets();
    this.loadMetrics();
  }

  loadMetrics() {
    console.log('Loading metrics...');
    this.adminService.getMetrics().subscribe({
      next: (data) => {
        console.log('Metrics loaded:', data);
        this.metrics = data;
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error('Error loading metrics', err);
        this.cdr.detectChanges();
      }
    });
  }

  loadTickets() {
    this.loading = true;

    const filters = {
      status: this.statusFilter.value ? this.statusFilter.value as TicketStatus : undefined,
      priority: this.priorityFilter.value ? this.priorityFilter.value as TicketPriority : undefined,
      category: this.categoryFilter.value ? this.categoryFilter.value as TicketCategory : undefined,
      q: this.searchControl.value || undefined
    };

    this.adminService.getAllTickets(filters, this.currentPage, this.pageSize).subscribe({
      next: (response: PageResponse<ItSupportTicketDto>) => {
        this.tickets = response.content;
        this.totalElements = response.totalElements;
        this.totalPages = response.totalPages;
        this.loading = false;
        this.cdr.detectChanges();
      },
      error: (err: any) => {
        console.error('Error loading tickets', err);
        this.loading = false;
        this.cdr.detectChanges();
      }
    });
  }

  applyFilters() {
    this.currentPage = 0;
    this.loadTickets();
  }

  clearFilters() {
    this.statusFilter.setValue('');
    this.priorityFilter.setValue('');
    this.categoryFilter.setValue('');
    this.searchControl.setValue('');
    this.applyFilters();
  }

  viewTicket(id: string) {
    this.router.navigate(['/admin/it-support', id]);
  }

  nextPage() {
    if (this.currentPage < this.totalPages - 1) {
      this.currentPage++;
      this.loadTickets();
    }
  }

  previousPage() {
    if (this.currentPage > 0) {
      this.currentPage--;
      this.loadTickets();
    }
  }

  getStatusClass(status: string): string {
    const baseClass = 'px-2 py-1 text-xs font-semibold rounded-full';
    switch (status) {
      case 'OPEN': return `${baseClass} bg-blue-100 text-blue-800`;
      case 'IN_PROGRESS': return `${baseClass} bg-yellow-100 text-yellow-800`;
      case 'WAITING_USER': return `${baseClass} bg-purple-100 text-purple-800`;
      case 'RESOLVED': return `${baseClass} bg-green-100 text-green-800`;
      case 'CLOSED': return `${baseClass} bg-gray-100 text-gray-800`;
      default: return `${baseClass} bg-gray-100 text-gray-800`;
    }
  }

  getPriorityClass(priority: string): string {
    const baseClass = 'px-2 py-1 text-xs font-semibold rounded-full';
    switch (priority) {
      case 'URGENT': return `${baseClass} bg-red-100 text-red-800`;
      case 'HIGH': return `${baseClass} bg-orange-100 text-orange-800`;
      case 'MEDIUM': return `${baseClass} bg-yellow-100 text-yellow-800`;
      case 'LOW': return `${baseClass} bg-green-100 text-green-800`;
      default: return `${baseClass} bg-gray-100 text-gray-800`;
    }
  }
}
