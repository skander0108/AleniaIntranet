import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { LeaveService } from '../../../core/services/leave.service';
import { LeaveBalance, LeaveRequest, LeaveType } from '../../../core/models/leave.model';
import { LeaveRequestModalComponent } from '../leave-request-modal/leave-request-modal.component';

@Component({
    selector: 'app-leave-dashboard',
    standalone: true,
    imports: [CommonModule, LeaveRequestModalComponent],
    templateUrl: './leave-dashboard.component.html'
})
export class LeaveDashboardComponent implements OnInit {
    balances: LeaveBalance[] = [];
    requests: LeaveRequest[] = [];
    leaveTypes: LeaveType[] = [];

    loadingDetails = true;
    isModalOpen = false;

    // Pagination for requests
    currentPage = 0;
    pageSize = 10;
    totalElements = 0;
    totalPages = 0;

    constructor(
        private leaveService: LeaveService,
        private cdr: ChangeDetectorRef
    ) { }

    ngOnInit() {
        this.loadData();
        this.loadLeaveTypes();
    }

    loadData() {
        this.loadingDetails = true;

        // Load Balances
        this.leaveService.getMyBalances().subscribe({
            next: (data) => {
                this.balances = data;
                // Don't set loadingDetails to false here, wait for requests, but do update view
                this.cdr.detectChanges();
            },
            error: (err) => console.error('Failed to load balances', err)
        });

        // Load Requests
        this.loadRequests();
    }

    loadRequests() {
        this.leaveService.getMyRequests(this.currentPage, this.pageSize).subscribe({
            next: (page) => {
                this.requests = page.content;
                this.totalElements = page.totalElements;
                this.totalPages = page.totalPages;
                this.loadingDetails = false;
                this.cdr.detectChanges();
            },
            error: (err) => {
                console.error('Failed to load requests', err);
                this.loadingDetails = false;
                this.cdr.detectChanges();
            }
        });
    }

    loadLeaveTypes() {
        this.leaveService.getLeaveTypes().subscribe(types => {
            this.leaveTypes = types;
            this.cdr.detectChanges();
        });
    }

    changePage(page: number) {
        if (page >= 0 && page < this.totalPages) {
            this.currentPage = page;
            this.loadRequests();
        }
    }

    openRequestModal() {
        this.isModalOpen = true;
    }

    onModalClose() {
        this.isModalOpen = false;
    }

    onRequestSubmitted() {
        this.loadData(); // Reload everything to update balances and list
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

    cancelRequest(id: string) {
        if (confirm('Are you sure you want to cancel this request?')) {
            this.leaveService.cancelRequest(id).subscribe(() => {
                this.loadData();
            });
        }
    }
}
