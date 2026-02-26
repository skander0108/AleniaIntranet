import { Component, OnInit, ChangeDetectorRef, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { ReactiveFormsModule, FormControl } from '@angular/forms';
import { ItSupportService } from '../../../core/services/it-support.service';
import {
  ItSupportTicketDetailDto,
  ItSupportCommentDto,
  TicketStatus
} from '../../../core/models/it-support.model';

@Component({
  selector: 'app-ticket-detail',
  standalone: true,
  imports: [CommonModule, RouterModule, ReactiveFormsModule],
  template: `
    <div class="min-h-screen bg-gray-50 py-8 px-4 sm:px-6 lg:px-8">
      <div class="max-w-4xl mx-auto">
        <button
          (click)="goBack()"
          class="mb-4 text-blue-600 hover:text-blue-800 flex items-center"
        >
          ← Back to My Tickets
        </button>

        <div *ngIf="loading" class="bg-white p-8 rounded-lg shadow-sm text-center">
          <p class="text-gray-500">Loading ticket...</p>
        </div>

        <div *ngIf="!loading && ticket" class="space-y-6">
          <!-- Ticket Header -->
          <div class="bg-white p-6 rounded-lg shadow-sm">
            <div class="flex justify-between items-start mb-4">
              <div>
                <h1 class="text-2xl font-bold text-gray-900">{{ ticket.title }}</h1>
                <p class="text-sm text-gray-500 mt-1">Ticket #{{ ticket.ticketNumber }}</p>
              </div>
              <div class="flex space-x-2">
                <span [class]="getStatusClass(ticket.status)">
                  {{ticket.status.replace('_', ' ')}}
                </span>
                <span [class]="getPriorityClass(ticket.priority)">
                  {{ ticket.priority }}
                </span>
              </div>
            </div>
            
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
              <div *ngIf="ticket.assignedToName">
                <span class="text-gray-500">Assigned to:</span>
                <span class="ml-2">{{ ticket.assignedToName }}</span>
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
                  <p class="text-xs text-gray-500">{{ formatFileSize(attachment.fileSize) }}</p>
                </div>
                <button
                  (click)="downloadAttachment(attachment.id)"
                  class="text-blue-600 hover:text-blue-800 text-sm"
                >
                  Download
                </button>
              </div>
            </div>
          </div>

          <!-- Comments -->
          <div class="bg-white p-6 rounded-lg shadow-sm">
            <h2 class="text-lg font-semibold mb-4">Comments</h2>
            
            <div *ngIf="ticket.comments.length === 0" class="text-gray-500 text-sm">
              No comments yet.
            </div>

            <div class="space-y-4 mb-6">
              <div
                *ngFor="let comment of ticket.comments"
                class="border-l-4 border-blue-500 pl-4 py-2"
              >
                <div class="flex justify-between items-start mb-1">
                  <span class="font-medium text-sm">{{ comment.authorName }}</span>
                  <span class="text-xs text-gray-500">{{ comment.createdAt | date:'short' }}</span>
                </div>
                <p class="text-gray-900 whitespace-pre-wrap">{{ comment.message }}</p>
              </div>
            </div>

            <!-- Add Comment -->
            <div class="border-t pt-4">
              <label class="block text-sm font-medium text-gray-700 mb-2">Add Comment</label>
              <textarea
                [formControl]="commentControl"
                rows="3"
                class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Type your comment..."
              ></textarea>
              <button
                (click)="addComment()"
                [disabled]="!commentControl.value || addingComment"
                class="mt-2 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
              >
                {{ addingComment ? 'Adding...' : 'Add Comment' }}
              </button>
            </div>
          </div>

          <!-- Close Ticket Button -->
          <div *ngIf="ticket.status === 'RESOLVED'" class="bg-white p-6 rounded-lg shadow-sm">
            <button
              (click)="closeTicket()"
              [disabled]="closingTicket"
              class="w-full px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:opacity-50"
            >
              {{ closingTicket ? 'Closing...' : 'Close Ticket' }}
            </button>
          </div>
        </div>
      </div>
    </div>
  `
})
export class TicketDetailComponent implements OnInit {
  ticket: ItSupportTicketDetailDto | null = null;
  loading = false;
  addingComment = false;
  closingTicket = false;
  commentControl = new FormControl('');

  private cdr = inject(ChangeDetectorRef);

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private itSupportService: ItSupportService
  ) { }

  ngOnInit() {
    const ticketId = this.route.snapshot.paramMap.get('id');
    if (ticketId) {
      this.loadTicket(ticketId);
    }
  }

  loadTicket(ticketId: string) {
    this.loading = true;
    this.itSupportService.getTicketDetails(ticketId).subscribe({
      next: (ticket: ItSupportTicketDetailDto) => {
        this.ticket = ticket;
        this.loading = false;
        this.cdr.detectChanges();
      },
      error: (err: any) => {
        console.error('Error loading ticket', err);
        this.loading = false;
        this.cdr.detectChanges();
        alert('Failed to load ticket');
        this.goBack();
      }
    });
  }

  addComment() {
    if (!this.ticket || !this.commentControl.value) return;

    this.addingComment = true;
    this.itSupportService.addComment(this.ticket.id, this.commentControl.value).subscribe({
      next: (comment: ItSupportCommentDto) => {
        this.ticket!.comments.push(comment);
        this.commentControl.setValue('');
        this.addingComment = false;
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error('Error adding comment', err);
        this.addingComment = false;
        this.cdr.detectChanges();
        alert('Failed to add comment');
      }
    });
  }

  closeTicket() {
    if (!this.ticket || !confirm('Are you sure you want to close this ticket?')) return;

    this.closingTicket = true;
    this.itSupportService.closeTicket(this.ticket.id).subscribe({
      next: () => {
        alert('Ticket closed successfully');
        this.goBack();
      },
      error: (err) => {
        console.error('Error closing ticket', err);
        this.closingTicket = false;
        this.cdr.detectChanges();
        alert('Failed to close ticket');
      }
    });
  }

  downloadAttachment(attachmentId: string) {
    if (!this.ticket) return;

    this.itSupportService.downloadAttachment(this.ticket.id, attachmentId).subscribe({
      next: (blob: Blob) => {
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'attachment';
        a.click();
        window.URL.revokeObjectURL(url);
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error('Error downloading attachment', err);
        alert('Failed to download attachment');
        this.cdr.detectChanges();
      }
    });
  }

  goBack() {
    this.router.navigate(['/it-support/my']);
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
