import { Component, OnInit, inject, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ExpenseService } from '../../../core/services/expense.service';
import { ExpenseReport, ExpenseStatus } from '../../../core/models/expense.model';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../../core/services/auth.service';

@Component({
    selector: 'app-manager-expense-approvals',
    standalone: true,
    imports: [CommonModule, FormsModule],
    templateUrl: './manager-expense-approvals.component.html',
    styleUrl: './manager-expense-approvals.component.css'
})
export class ManagerExpenseApprovalsComponent implements OnInit {
    private expenseService = inject(ExpenseService);
    public authService = inject(AuthService); // public for template
    private cdr = inject(ChangeDetectorRef);

    expenses: ExpenseReport[] = [];
    loading = true;
    error: string | null = null;
    processingId: string | null = null;
    rejectReason = '';
    showRejectModal = false;
    selectedReport: ExpenseReport | null = null;

    // For viewing details in a modal
    viewReport: ExpenseReport | null = null;

    ngOnInit() {
        this.loadPendingExpenses();
    }

    get isFinanceOrAdmin() {
        return this.authService.hasRole('ADMIN');
    }

    loadPendingExpenses() {
        this.loading = true;
        this.expenseService.getPendingExpenses(0, 50).subscribe({
            next: (page) => {
                this.expenses = page.content;
                this.loading = false;
                this.cdr.detectChanges();
            },
            error: (err) => {
                console.error('Failed to load pending expenses', err);
                this.error = 'Failed to load team expense reports.';
                this.loading = false;
                this.cdr.detectChanges();
            }
        });

        // If Admin/Finance, we should also load APPROVED expenses to PAY them
        // But currently backend gets only SUBMITTED if we use pending. 
        // Usually Admin would use a separate tab, but we'll stick to basic approval for now.
    }

    openDetails(report: ExpenseReport) {
        this.loading = true;
        this.expenseService.getExpenseById(report.id).subscribe({
            next: (fullReport) => {
                this.viewReport = fullReport;
                this.loading = false;
                this.cdr.detectChanges();
            },
            error: () => {
                this.loading = false;
                this.cdr.detectChanges();
            }
        });
    }

    closeDetails() {
        this.viewReport = null;
        this.cdr.detectChanges();
    }

    approve(id: string) {
        if (!confirm('Are you sure you want to approve this expense report?')) return;
        this.processingId = id;
        this.expenseService.approveExpenseReport(id).subscribe({
            next: () => {
                this.expenses = this.expenses.filter(e => e.id !== id);
                this.processingId = null;
                if (this.viewReport?.id === id) this.closeDetails();
                this.cdr.detectChanges();
            },
            error: () => {
                alert('Failed to approve');
                this.processingId = null;
                this.cdr.detectChanges();
            }
        });
    }

    openRejectModal(report: ExpenseReport) {
        this.selectedReport = report;
        this.rejectReason = '';
        this.showRejectModal = true;
    }

    closeRejectModal() {
        this.selectedReport = null;
        this.rejectReason = '';
        this.showRejectModal = false;
        this.cdr.detectChanges();
    }

    confirmReject() {
        if (!this.selectedReport || !this.rejectReason) return;

        this.processingId = this.selectedReport.id;
        this.expenseService.rejectExpenseReport(this.selectedReport.id, this.rejectReason).subscribe({
            next: () => {
                this.expenses = this.expenses.filter(e => e.id !== this.selectedReport!.id);
                this.processingId = null;
                this.closeRejectModal();
                if (this.viewReport?.id === this.selectedReport?.id) this.closeDetails();
                this.cdr.detectChanges();
            },
            error: () => {
                alert('Failed to reject');
                this.processingId = null;
                this.cdr.detectChanges();
            }
        });
    }

    formatImageUrl(url?: string): string {
        if (!url) return '';
        if (url.startsWith('http') || url.startsWith('/api/') || url.startsWith('assets/')) {
            return url;
        }
        return '/api/files/' + url;
    }
}
