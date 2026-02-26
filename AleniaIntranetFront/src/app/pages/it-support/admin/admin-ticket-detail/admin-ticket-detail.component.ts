import { Component, OnInit, ChangeDetectorRef, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { ReactiveFormsModule, FormControl } from '@angular/forms';
import { AdminItSupportService } from '../../../../core/services/admin-it-support.service';
import {
  ItSupportTicketDetailDto,
  ItSupportCommentDto,
  TicketStatus,
  TicketUpdateDto,
  ItSupportAuditLogDto
} from '../../../../core/models/it-support.model';

@Component({
  selector: 'app-admin-ticket-detail',
  standalone: true,
  imports: [CommonModule, RouterModule, ReactiveFormsModule],
  template: `
    <div class="min-h-screen bg-gray-50 py-8 px-4 sm:px-6 lg:px-8">
      <div class="max-w-5xl mx-auto">
        <button
          (click)="goBack()"
          class="mb-4 text-blue-600 hover:text-blue-800 flex items-center"
        >
          ← Back to All Tickets
        </button>

        <!-- Loading State -->
        <div *ngIf="loading" class="bg-white p-8 rounded-lg shadow-sm text-center">
          <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p class="text-gray-500">Loading ticket details...</p>
        </div>

        <!-- Error State (if not loading and no ticket) -->
        <div *ngIf="!loading && !ticket" class="bg-red-50 p-8 rounded-lg shadow-sm text-center border border-red-200">
          <p class="text-red-600 font-medium">Ticket not found or failed to load.</p>
          <button (click)="goBack()" class="mt-4 px-4 py-2 bg-red-100 text-red-700 rounded hover:bg-red-200">
             Go Back
          </button>
        </div>

        <!-- content -->
        <div *ngIf="!loading && ticket" class="space-y-6">
          <!-- Ticket Header with Admin Actions -->
          <div class="bg-white p-6 rounded-lg shadow-sm">
            <div class="flex justify-between items-start mb-6">
              <div>
                <h1 class="text-2xl font-bold text-gray-900">{{ ticket.title }}</h1>
                <p class="text-sm text-gray-500 mt-1">Ticket #{{ ticket.ticketNumber }}</p>
              </div>
              <div class="flex space-x-2">
                <span [class]="getStatusClass(ticket.status)">
                  {{ ticket.status.replace('_', ' ') }}
                </span>
                <span [class]="getPriorityClass(ticket.priority)">
                  {{ ticket.priority }}
                </span>
              </div>
            </div>

            <!-- Admin Actions -->
            <div class="border-t border-b py-4 mb-4 bg-gray-50 -mx-6 px-6">
              <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-1">Change Status</label>
                  <select
                    [formControl]="statusControl"
                    class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option *ngFor="let status of statuses" [value]="status">
                      {{ status.replace('_', ' ') }}
                    </option>
                  </select>
                </div>

                <div class="flex items-end space-x-2">
                  <button
                    (click)="updateStatus()"
                    [disabled]="updating || statusControl.value === ticket.status"
                    class="flex-1 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
                  >
                    {{ updating ? 'Updating...' : 'Update Status' }}
                  </button>
                  
                  <button
                    *ngIf="ticket.status === 'RESOLVED' || ticket.status === 'CLOSED'"
                    (click)="convertToKb()"
                    [disabled]="converting"
                    class="px-4 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700 disabled:opacity-50"
                    title="Convert to Knowledge Base Article"
                  >
                    {{ converting ? 'Converting...' : 'Convert to KB' }}
                  </button>
                </div>
              </div>
            </div>

            <!-- Ticket Information -->
            <div class="grid grid-cols-2 gap-4 mb-4 text-sm">
              <div>
                <span class="text-gray-500">Category:</span>
                <span class="ml-2 font-medium">{{ ticket.category }}</span>
              </div>
              <div>
                <span class="text-gray-500">Created:</span>
                <span class="ml-2">{{ ticket.createdAt | date:'medium' }}</span>
              </div>
              <div>
                <span class="text-gray-500">Requester:</span>
                <span class="ml-2">{{ ticket.requesterName }}</span>
              </div>
              <div>
                <span class="text-gray-500">Assigned To:</span>
                <span class="ml-2">{{ ticket.assignedToName || 'Unassigned' }}</span>
              </div>
              <div>
                <span class="text-gray-500">Last Updated:</span>
                <span class="ml-2">{{ ticket.updatedAt | date:'short' }}</span>
              </div>
              <div *ngIf="ticket.updatedByName">
                <span class="text-gray-500">Updated By:</span>
                <span class="ml-2">{{ ticket.updatedByName }}</span>
              </div>
            </div>

            <div class="border-t pt-4">
              <h3 class="text-sm font-medium text-gray-500 mb-2">Description</h3>
              <p class="text-gray-900 whitespace-pre-wrap">{{ ticket.description }}</p>
            </div>

            <div *ngIf="ticket.preferredContact" class="border-t mt-4 pt-4">
              <span class="text-sm text-gray-500">Preferred Contact: </span>
              <span class="text-sm">{{ ticket.preferredContact }}</span>
            </div>
            
            <!-- Audit Log Expand -->
            <div class="border-t mt-4 pt-4">
              <button 
                (click)="toggleAuditLog()"
                class="text-sm text-gray-500 flex items-center hover:text-gray-700 focus:outline-none"
              >
                <span class="mr-1">{{ showAuditLog ? '▼' : '►' }}</span>
                View Audit Log
              </button>
              
              <div *ngIf="showAuditLog" class="mt-4 bg-gray-50 rounded p-4 text-xs">
                <div *ngIf="loadingAuditLog" class="text-gray-500">Loading history...</div>
                <div *ngIf="!loadingAuditLog && auditLogs.length === 0" class="text-gray-500">No history available.</div>
                
                <ul *ngIf="!loadingAuditLog && auditLogs.length > 0" class="space-y-3">
                  <li *ngFor="let log of auditLogs" class="border-l-2 border-gray-300 pl-3">
                    <div class="flex justify-between items-start">
                      <span class="font-medium text-gray-700">{{ log.action.replace('_', ' ') }}</span>
                      <span class="text-gray-400">{{ log.timestamp | date:'short' }}</span>
                    </div>
                    <div class="text-gray-600">by {{ log.changedByFullName }}</div>
                    <div *ngIf="log.oldValue || log.newValue" class="mt-1 text-gray-500">
                      <span *ngIf="log.oldValue">{{ log.oldValue }}</span>
                      <span *ngIf="log.oldValue && log.newValue"> → </span>
                      <span *ngIf="log.newValue">{{ log.newValue }}</span>
                    </div>
                  </li>
                </ul>
              </div>
            </div>
          </div>

          <!-- Attachments -->
          <div *ngIf="ticket.attachments.length > 0" class="bg-white p-6 rounded-lg shadow-sm">
            <h2 class="text-lg font-semibold mb-4">Attachments</h2>
            <div class="space-y-2">
              <div
                *ngFor="let attachment of ticket.attachments"
                class="flex items-center justify-between p-3 bg-gray-50 rounded"
              >
                <div>
                  <p class="font-medium text-sm">{{ attachment.fileName }}</p>
                  <p class="text-xs text-gray-500">
                    {{ formatFileSize(attachment.fileSize) }} • {{ attachment.uploadedAt | date:'short' }}
                  </p>
                </div>
              </div>
            </div>
          </div>

          <!-- Comments -->
          <div class="bg-white p-6 rounded-lg shadow-sm">
            <h2 class="text-lg font-semibold mb-4">Comments & Communication</h2>
            
            <div *ngIf="ticket.comments.length === 0" class="text-gray-500 text-sm mb-6">
              No comments yet.
            </div>

            <div class="space-y-4 mb-6">
              <div
                *ngFor="let comment of ticket.comments"
                class="border-l-4 border-blue-500 pl-4 py-2 bg-gray-50 rounded-r"
              >
                <div class="flex justify-between items-start mb-1">
                  <span class="font-medium text-sm">{{ comment.authorName }}</span>
                  <span class="text-xs text-gray-500">{{ comment.createdAt | date:'short' }}</span>
                </div>
                <p class="text-gray-900 whitespace-pre-wrap">{{ comment.message }}</p>
              </div>
            </div>

            <!-- Add Admin Comment -->
            <div class="border-t pt-4">
              <label class="block text-sm font-medium text-gray-700 mb-2">Add Response</label>
              <textarea
                [formControl]="commentControl"
                rows="4"
                class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Type your response to the requester..."
              ></textarea>
              <button
                (click)="addComment()"
                [disabled]="!commentControl.value || addingComment"
                class="mt-2 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
              >
                {{ addingComment ? 'Sending...' : 'Send Response' }}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  `
})
export class AdminTicketDetailComponent implements OnInit {
  ticket: ItSupportTicketDetailDto | null = null;
  loading = false;
  updating = false;
  addingComment = false;

  // Audit Log & KB
  auditLogs: ItSupportAuditLogDto[] = [];
  showAuditLog = false;
  loadingAuditLog = false;
  converting = false;

  statuses = Object.values(TicketStatus);
  statusControl = new FormControl('');
  commentControl = new FormControl('');

  private cdr = inject(ChangeDetectorRef);

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private adminService: AdminItSupportService
  ) { }

  ngOnInit() {
    const ticketId = this.route.snapshot.paramMap.get('id');
    console.log('AdminTicketDetailComponent initialized for ticket:', ticketId);
    if (ticketId) {
      this.loadTicket(ticketId);
    }
  }

  loadTicket(ticketId: string) {
    this.loading = true;
    this.adminService.getTicketDetails(ticketId).subscribe({
      next: (ticket: ItSupportTicketDetailDto) => {
        console.log('Ticket details loaded:', ticket);
        this.ticket = ticket;
        this.statusControl.setValue(ticket.status);
        this.loading = false;
        this.cdr.detectChanges(); // Force update
      },
      error: (err: any) => {
        console.error('Error loading ticket', err);
        this.loading = false;
        alert('Failed to load ticket');
        this.goBack();
        this.cdr.detectChanges(); // Force update on error too
      }
    });
  }

  updateStatus() {
    if (!this.ticket || !this.statusControl.value) return;

    this.updating = true;
    const dto: TicketUpdateDto = {
      status: this.statusControl.value as TicketStatus
    };

    this.adminService.updateTicket(this.ticket.id, dto).subscribe({
      next: (updated) => {
        const oldStatus = this.ticket?.status;
        this.ticket = updated;
        this.updating = false;
        // Refresh audit log if open
        if (this.showAuditLog) {
          this.loadAuditLog();
        }
        this.cdr.detectChanges();
        alert('Ticket status updated successfully');
      },
      error: (err) => {
        console.error('Error updating ticket', err);
        this.updating = false;
        this.cdr.detectChanges();
        alert('Failed to update ticket status');
      }
    });
  }

  addComment() {
    if (!this.ticket || !this.commentControl.value) return;

    this.addingComment = true;
    this.adminService.addComment(this.ticket.id, this.commentControl.value).subscribe({
      next: (comment: ItSupportCommentDto) => {
        this.ticket!.comments.push(comment);
        this.commentControl.setValue('');
        this.addingComment = false;
        if (this.showAuditLog) {
          this.loadAuditLog();
        }
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error('Error adding comment', err);
        this.addingComment = false;
        this.cdr.detectChanges();
        alert('Failed to add response');
      }
    });
  }

  toggleAuditLog() {
    this.showAuditLog = !this.showAuditLog;
    if (this.showAuditLog && this.ticket) {
      this.loadAuditLog();
    }
  }

  loadAuditLog() {
    if (!this.ticket) return;
    this.loadingAuditLog = true;
    this.adminService.getAuditLog(this.ticket.id).subscribe({
      next: (logs) => {
        this.auditLogs = logs;
        this.loadingAuditLog = false;
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error('Error loading audit log', err);
        this.loadingAuditLog = false;
        this.cdr.detectChanges();
      }
    });
  }

  convertToKb() {
    if (!this.ticket) return;
    if (!confirm('Are you sure you want to convert this ticket to a Knowledge Base article?')) return;

    this.converting = true;
    this.adminService.convertToKb(this.ticket.id).subscribe({
      next: () => {
        this.converting = false;
        alert('Ticket converted to Knowledge Base article successfully!');
        if (this.showAuditLog) {
          this.loadAuditLog();
        }
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error('Error converting to KB', err);
        this.converting = false;
        this.cdr.detectChanges();
        alert('Failed to convert ticket to KB article');
      }
    });
  }

  goBack() {
    this.router.navigate(['/admin/it-support']);
  }

  formatFileSize(bytes: number): string {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
  }

  getStatusClass(status: string): string {
    const baseClass = 'px-3 py-1 text-sm font-semibold rounded-full';
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
    const baseClass = 'px-3 py-1 text-sm font-semibold rounded-full';
    switch (priority) {
      case 'URGENT': return `${baseClass} bg-red-100 text-red-800`;
      case 'HIGH': return `${baseClass} bg-orange-100 text-orange-800`;
      case 'MEDIUM': return `${baseClass} bg-yellow-100 text-yellow-800`;
      case 'LOW': return `${baseClass} bg-green-100 text-green-800`;
      default: return `${baseClass} bg-gray-100 text-gray-800`;
    }
  }
}
