import { Component, OnInit, ChangeDetectorRef, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { ItSupportService } from '../../../core/services/it-support.service';
import { ItSupportTicketDto, PageResponse } from '../../../core/models/it-support.model';

@Component({
  selector: 'app-my-tickets',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <div class="min-h-screen bg-gray-50 py-8 px-4 sm:px-6 lg:px-8">
      <div class="max-w-6xl mx-auto">
        <div class="flex justify-between items-center mb-6">
          <h1 class="text-2xl font-bold text-gray-900">My IT Support Tickets</h1>
          <button
            (click)="createTicket()"
            class="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
          >
            New Ticket
          </button>
        </div>

        <div class="bg-white shadow-sm rounded-lg overflow-hidden">
          <div *ngIf="loading" class="p-8 text-center">
            <p class="text-gray-500">Loading tickets...</p>
          </div>

          <div *ngIf="!loading && tickets.length === 0" class="p-8 text-center">
            <p class="text-gray-500">No tickets found. Create your first support request!</p>
          </div>

          <div *ngIf="!loading && tickets.length > 0">
            <table class="min-w-full divide-y divide-gray-200">
              <thead class="bg-gray-50">
                <tr>
                  <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Ticket #</th>
                  <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Title</th>
                  <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Category</th>
                  <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Priority</th>
                  <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
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
export class MyTicketsComponent implements OnInit {
  tickets: ItSupportTicketDto[] = [];
  loading = false;
  currentPage = 0;
  pageSize = 10;
  totalElements = 0;
  totalPages = 0;
  Math = Math;

  private cdr = inject(ChangeDetectorRef);

  constructor(
    private itSupportService: ItSupportService,
    private router: Router
  ) { }

  ngOnInit() {
    this.loadTickets();
  }

  loadTickets() {
    this.loading = true;
    this.itSupportService.getMyTickets(this.currentPage, this.pageSize).subscribe({
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

  viewTicket(id: string) {
    this.router.navigate(['/it-support/my', id]);
  }

  createTicket() {
    this.router.navigate(['/it-support/create']);
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
