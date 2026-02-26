import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { LeavePeriod, LeaveType, LeaveRequestCreate } from '../../../core/models/leave.model';
import { LeaveService } from '../../../core/services/leave.service';

@Component({
    selector: 'app-leave-request-modal',
    standalone: true,
    imports: [CommonModule, ReactiveFormsModule],
    templateUrl: './leave-request-modal.component.html'
})
export class LeaveRequestModalComponent implements OnInit {
    @Input() leaveTypes: LeaveType[] = [];
    @Output() close = new EventEmitter<void>();
    @Output() submitted = new EventEmitter<void>();

    requestForm: FormGroup;
    isSubmitting = false;
    estimatedDuration = 0;
    LeavePeriod = LeavePeriod;

    constructor(
        private fb: FormBuilder,
        private leaveService: LeaveService
    ) {
        this.requestForm = this.fb.group({
            leaveTypeId: ['', Validators.required],
            startDate: ['', Validators.required],
            startPeriod: [LeavePeriod.AM, Validators.required],
            endDate: ['', Validators.required],
            endPeriod: [LeavePeriod.PM, Validators.required],
            reason: ['', Validators.required]
        });
    }

    ngOnInit() {
        // Recalculate duration on form changes
        this.requestForm.valueChanges.subscribe(() => {
            this.calculateDuration();
        });
    }

    calculateDuration() {
        const start = this.requestForm.get('startDate')?.value;
        const end = this.requestForm.get('endDate')?.value;
        const startPeriod = this.requestForm.get('startPeriod')?.value;
        const endPeriod = this.requestForm.get('endPeriod')?.value;

        if (!start || !end) {
            this.estimatedDuration = 0;
            return;
        }

        const startDate = new Date(start);
        const endDate = new Date(end);

        if (endDate < startDate) {
            this.estimatedDuration = 0;
            return;
        }

        // specific logic for duration calculation
        // This is a simplified frontend estimation. Backend is source of truth.
        // Basic logic: count weekdays.
        let count = 0;
        let current = new Date(startDate);

        while (current <= endDate) {
            const dayOfWeek = current.getDay();
            if (dayOfWeek !== 0 && dayOfWeek !== 6) { // Not Sunday(0) or Saturday(6)
                count++;
            }
            current.setDate(current.getDate() + 1);
        }

        // Adjust for half days
        // If start/end are same day
        if (startDate.getTime() === endDate.getTime()) {
            if (startPeriod === endPeriod) {
                // Same day, same period = 0.5 (e.g. Morning only)
                // Wait, if Start=AM and End=AM, it's 0.5.
                // If Start=AM and End=PM, it's 1.0.
                // If Start=PM and End=PM, it's 0.5.
                if (startPeriod !== endPeriod) { // AM to PM
                    // count is already 1
                } else {
                    count -= 0.5;
                }
            }
        } else {
            // Multi day
            if (startPeriod === LeavePeriod.PM) count -= 0.5;
            if (endPeriod === LeavePeriod.AM) count -= 0.5;
        }

        this.estimatedDuration = Math.max(0, count);
    }

    onSubmit() {
        if (this.requestForm.invalid) return;

        this.isSubmitting = true;
        const formValue = this.requestForm.value;

        const request: LeaveRequestCreate = {
            leaveTypeId: formValue.leaveTypeId,
            startDate: formValue.startDate,
            startPeriod: formValue.startPeriod,
            endDate: formValue.endDate,
            endPeriod: formValue.endPeriod,
            reason: formValue.reason
        };

        this.leaveService.createRequest(request).subscribe({
            next: () => {
                this.isSubmitting = false;
                this.submitted.emit();
                this.close.emit();
            },
            error: (err) => {
                console.error('Error creating request', err);
                this.isSubmitting = false;
                // Ideally show toast here
                alert('Failed to submit request: ' + (err.error?.message || 'Unknown error'));
            }
        });
    }
}
