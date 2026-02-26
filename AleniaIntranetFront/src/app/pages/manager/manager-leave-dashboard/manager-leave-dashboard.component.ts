import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Subject, of } from 'rxjs';
import { debounceTime, switchMap, tap, catchError } from 'rxjs/operators';
import { LeaveService } from '../../../core/services/leave.service';
import { LeaveRequest, LeaveStatus } from '../../../core/models/leave.model';

@Component({
    selector: 'app-manager-leave-dashboard',
    standalone: true,
    imports: [CommonModule, FormsModule],
    templateUrl: './manager-leave-dashboard.component.html'
})
export class ManagerLeaveDashboardComponent implements OnInit {
    requests: LeaveRequest[] = [];
    loading = true;

    // Pagination
    currentPage = 0;
    pageSize = 10;
    totalElements = 0;
    totalPages = 0;

    // Filter
    currentStatus: LeaveStatus | 'ALL' = LeaveStatus.PENDING;
    LeaveStatus = LeaveStatus;

    // Reject Modal
    isRejectModalOpen = false;
    rejectRequestId: string | null = null;
    rejectReason = '';

    private loadRequestsSubject = new Subject<void>();

    constructor(private leaveService: LeaveService, private cdr: ChangeDetectorRef) { }

    ngOnInit() {
        this.setupRequestLoading();
        this.loadRequests();
    }

    private setupRequestLoading() {
        this.loadRequestsSubject.pipe(
            tap(() => this.loading = true),
            debounceTime(300), // Prevent rapid duplicate calls
            switchMap(() => {
                const status = this.currentStatus === 'ALL' ? undefined : this.currentStatus;
                return this.leaveService.getTeamRequests(this.currentPage, this.pageSize, status).pipe(
                    catchError(err => {
                        console.error('Failed to load team requests', err);
                        this.loading = false;
                        return of(null);
                    })
                );
            })
        ).subscribe(page => {
            if (page) {
                this.requests = page.content;
                this.totalElements = page.totalElements;
                this.totalPages = page.totalPages;
            }
            this.loading = false;
            this.cdr.markForCheck();
        });
    }

    loadRequests() {
        this.loadRequestsSubject.next();
    }

    changeTab(status: LeaveStatus | 'ALL') {
        if (this.currentStatus !== status) {
            this.currentStatus = status;
            this.currentPage = 0;
            this.loadRequests();
        }
    }

    changePage(page: number) {
        if (page >= 0 && page < this.totalPages) {
            this.currentPage = page;
            this.loadRequests();
        }
    }

    approveRequest(id: string) {
        if (confirm('Are you sure you want to approve this request?')) {
            this.leaveService.approveRequest(id).subscribe({
                next: () => {
                    this.loadRequests();
                },
                error: (err) => alert('Failed to approve request')
            });
        }
    }

    openRejectModal(id: string) {
        this.rejectRequestId = id;
        this.rejectReason = '';
        this.isRejectModalOpen = true;
    }

    closeRejectModal() {
        this.isRejectModalOpen = false;
        this.rejectRequestId = null;
    }

    confirmReject() {
        if (!this.rejectRequestId || !this.rejectReason.trim()) return;

        this.leaveService.rejectRequest(this.rejectRequestId, this.rejectReason).subscribe({
            next: () => {
                this.closeRejectModal();
                this.loadRequests();
            },
            error: (err) => alert('Failed to reject request')
        });
    }

    getStatusClass(status: string): string {
        switch (status) {
            case 'APPROVED': return 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300';
            case 'PENDING': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300';
            case 'REJECTED': return 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300';
            case 'CANCELLED': return 'bg-gray-100 text-gray-800 dark:bg-gray-700/50 dark:text-gray-300';
            default: return 'bg-gray-100 text-gray-800';
        }
    }
}
