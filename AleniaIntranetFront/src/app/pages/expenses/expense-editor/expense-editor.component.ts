import { Component, OnInit, inject, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { ExpenseService } from '../../../core/services/expense.service';
import { ExpenseReport, ExpenseStatus, ExpenseCategory, ExpenseLineCreateDto } from '../../../core/models/expense.model';

@Component({
    selector: 'app-expense-editor',
    standalone: true,
    imports: [CommonModule, ReactiveFormsModule, RouterLink],
    templateUrl: './expense-editor.component.html',
    styleUrl: './expense-editor.component.css'
})
export class ExpenseEditorComponent implements OnInit {
    private fb = inject(FormBuilder);
    private expenseService = inject(ExpenseService);
    private route = inject(ActivatedRoute);
    private router = inject(Router);
    private cdr = inject(ChangeDetectorRef);

    report: ExpenseReport | null = null;
    reportId: string | null = null;
    isNew = true;
    loading = false;
    saving = false;
    error: string | null = null;

    categories = [
        { value: ExpenseCategory.TRANSPORT, label: 'Transport' },
        { value: ExpenseCategory.HOTEL, label: 'Hotel' },
        { value: ExpenseCategory.MEAL, label: 'Meals & Dining' },
        { value: ExpenseCategory.OTHER, label: 'Other/Misc' }
    ];

    headerForm: FormGroup = this.fb.group({
        missionName: ['', Validators.required],
        startDate: ['', Validators.required],
        endDate: ['', Validators.required],
        description: ['']
    });

    lineForm: FormGroup = this.fb.group({
        category: [ExpenseCategory.TRANSPORT, Validators.required],
        amount: ['', [Validators.required, Validators.min(0.01)]],
        currency: ['EUR'],
        expenseDate: ['', Validators.required],
        vatAmount: [0],
        comment: ['']
    });

    selectedReceipt: File | null = null;
    showLineForm = false;
    uploadingLine = false;

    get isDraft(): boolean {
        return !this.report || this.report.status === ExpenseStatus.DRAFT;
    }

    ngOnInit() {
        this.reportId = this.route.snapshot.paramMap.get('id');
        if (this.reportId && this.reportId !== 'new') {
            this.isNew = false;
            this.loadReport(this.reportId);
        } else {
            this.isNew = true;
            // Default dates to today
            const today = new Date().toISOString().split('T')[0];
            this.headerForm.patchValue({ startDate: today, endDate: today });
            this.lineForm.patchValue({ expenseDate: today });
        }
    }

    loadReport(id: string) {
        this.loading = true;
        this.expenseService.getExpenseById(id).subscribe({
            next: (data: any) => {
                this.report = data;
                this.headerForm.patchValue(data);
                if (!this.isDraft) {
                    this.headerForm.disable();
                }
                this.loading = false;
                this.cdr.detectChanges();
            },
            error: (err: any) => {
                this.error = 'Failed to load expense report';
                this.loading = false;
                this.cdr.detectChanges();
            }
        });
    }

    saveHeader() {
        if (this.headerForm.invalid) return;

        this.saving = true;
        const obs$ = this.isNew
            ? this.expenseService.createExpenseReport(this.headerForm.value)
            : this.expenseService.updateExpenseReport(this.reportId!, this.headerForm.value);

        obs$.subscribe({
            next: (data: any) => {
                this.report = data;
                this.reportId = data.id;
                const wasNew = this.isNew;
                this.isNew = false;
                this.saving = false;
                this.cdr.detectChanges();
                if (wasNew) {
                    this.router.navigate(['/expenses', data.id], { replaceUrl: true });
                }
            },
            error: (err: any) => {
                this.error = 'Failed to save mission details';
                this.saving = false;
                this.cdr.detectChanges();
            }
        });
    }

    onFileSelected(event: any) {
        this.selectedReceipt = event.target.files[0];
    }

    addLine() {
        if (this.lineForm.invalid || !this.reportId) return;

        // Receipt validation
        const amount = this.lineForm.value.amount;
        if (amount > 10 && !this.selectedReceipt) {
            alert('A receipt is required for expenses over 10 EUR.');
            return;
        }

        this.uploadingLine = true;
        this.expenseService.addExpenseLine(this.reportId, this.lineForm.value, this.selectedReceipt || undefined)
            .subscribe({
                next: (data: any) => {
                    this.report = data;
                    this.showLineForm = false;
                    this.lineForm.reset({ category: ExpenseCategory.TRANSPORT, currency: 'EUR', vatAmount: 0 });
                    this.selectedReceipt = null;
                    this.uploadingLine = false;
                    this.cdr.detectChanges();
                },
                error: (err: any) => {
                    this.error = 'Failed to add expense line';
                    this.uploadingLine = false;
                    this.cdr.detectChanges();
                }
            });
    }

    deleteLine(lineId: string) {
        if (!this.reportId || !confirm('Are you sure you want to delete this expense line?')) return;

        this.loading = true;
        this.expenseService.deleteExpenseLine(this.reportId, lineId).subscribe({
            next: () => {
                this.loadReport(this.reportId!);
                this.cdr.detectChanges();
            },
            error: (err: any) => {
                this.error = 'Failed to delete line';
                this.loading = false;
                this.cdr.detectChanges();
            }
        });
    }

    submitReport() {
        if (!this.reportId || !confirm('Are you sure you want to submit? You won\'t be able to edit it anymore.')) return;

        this.saving = true;
        this.expenseService.submitExpenseReport(this.reportId).subscribe({
            next: (data: any) => {
                this.report = data;
                this.headerForm.disable();
                this.saving = false;
                this.cdr.detectChanges();
                this.router.navigate(['/expenses/my']);
            },
            error: (err: any) => {
                this.error = err.error?.message || 'Failed to submit report';
                this.saving = false;
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
