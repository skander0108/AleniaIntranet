import { Component, OnInit, inject, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { ExpenseService } from '../../../core/services/expense.service';
import { ExpenseReport, ExpenseStatus } from '../../../core/models/expense.model';
import { FormsModule } from '@angular/forms';

@Component({
    selector: 'app-expenses-dashboard',
    standalone: true,
    imports: [CommonModule, RouterLink, FormsModule],
    templateUrl: './expenses-dashboard.component.html',
    styleUrl: './expenses-dashboard.component.css'
})
export class ExpensesDashboardComponent implements OnInit {
    private expenseService = inject(ExpenseService);
    private cdr = inject(ChangeDetectorRef);

    expenses: ExpenseReport[] = [];
    loading = true;
    error: string | null = null;

    ngOnInit() {
        this.loadExpenses();
    }

    loadExpenses() {
        this.loading = true;
        this.expenseService.getMyExpenses(0, 50).subscribe({
            next: (page: any) => {
                this.expenses = page.content;
                this.loading = false;
                this.cdr.detectChanges();
            },
            error: (err: any) => {
                console.error('Failed to load expenses', err);
                this.error = 'Failed to load your expense reports.';
                this.loading = false;
                this.cdr.detectChanges();
            }
        });
    }

    getStatusClass(status: ExpenseStatus): string {
        const map: Record<string, string> = {
            'DRAFT': 'bg-gray-100 text-gray-800 dark:bg-gray-900/50 dark:text-gray-300',
            'SUBMITTED': 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/50 dark:text-yellow-300',
            'APPROVED': 'bg-green-100 text-green-800 dark:bg-green-900/50 dark:text-green-300',
            'REJECTED': 'bg-red-100 text-red-800 dark:bg-red-900/50 dark:text-red-300',
            'PAID': 'bg-blue-100 text-blue-800 dark:bg-blue-900/50 dark:text-blue-300'
        };
        return `px-2.5 py-0.5 rounded-full text-xs font-medium uppercase tracking-wider ${map[status as string] || map['DRAFT']}`;
    }
}
