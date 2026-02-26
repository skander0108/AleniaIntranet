import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { ItSupportService } from '../../../core/services/it-support.service';
import {
    ItSupportTicketCreateDto,
    TicketCategory,
    TicketPriority
} from '../../../core/models/it-support.model';

@Component({
    selector: 'app-ticket-create',
    standalone: true,
    imports: [CommonModule, ReactiveFormsModule],
    templateUrl: './ticket-create.component.html'
})
export class TicketCreateComponent {
    ticketForm: FormGroup;
    selectedFile: File | undefined;
    isSaving = false;

    categories = Object.values(TicketCategory);
    priorities = Object.values(TicketPriority);

    constructor(
        private fb: FormBuilder,
        private itSupportService: ItSupportService,
        private router: Router
    ) {
        this.ticketForm = this.fb.group({
            title: ['', [Validators.required, Validators.maxLength(200)]],
            category: [TicketCategory.OTHER, Validators.required],
            priority: [TicketPriority.MEDIUM, Validators.required],
            description: ['', [Validators.required, Validators.maxLength(2000)]],
            preferredContact: ['', Validators.email]
        });
    }

    onFileSelected(event: any) {
        const file = event.target.files[0];
        if (file) {
            if (file.size > 5 * 1024 * 1024) {
                alert('File size must be less than 5MB');
                event.target.value = '';
                return;
            }

            const allowedTypes = ['image/png', 'image/jpeg', 'application/pdf', 'text/plain'];
            if (!allowedTypes.includes(file.type)) {
                alert('Only PNG, JPG, PDF, and TXT files are allowed');
                event.target.value = '';
                return;
            }

            this.selectedFile = file;
        }
    }

    createTicket() {
        if (this.ticketForm.invalid) {
            this.ticketForm.markAllAsTouched();
            return;
        }

        this.isSaving = true;
        const dto: ItSupportTicketCreateDto = this.ticketForm.value;

        // If there's a file, use FormData
        if (this.selectedFile) {
            const formData = new FormData();
            formData.append('title', dto.title);
            formData.append('category', dto.category);
            formData.append('priority', dto.priority);
            formData.append('description', dto.description);
            if (dto.preferredContact) {
                formData.append('preferredContact', dto.preferredContact);
            }
            formData.append('file', this.selectedFile);

            this.itSupportService.createTicketWithFile(formData).subscribe({
                next: (ticket) => {
                    this.isSaving = false;
                    alert(`Ticket created successfully! Your ticket number is: ${ticket.ticketNumber}`);
                    this.router.navigate(['/it-support/my']);
                },
                error: (err: any) => {
                    console.error('Error creating ticket', err);
                    this.isSaving = false;
                    alert('Failed to create ticket. Please try again.');
                }
            });
        } else {
            // No file, use regular DTO
            this.itSupportService.createTicket(dto).subscribe({
                next: (ticket) => {
                    this.isSaving = false;
                    alert(`Ticket created successfully! Your ticket number is: ${ticket.ticketNumber}`);
                    this.router.navigate(['/it-support/my']);
                },
                error: (err: any) => {
                    console.error('Error creating ticket', err);
                    this.isSaving = false;
                    alert('Failed to create ticket. Please try again.');
                }
            });
        }
    }

    cancel() {
        this.router.navigate(['/it-support/my']);
    }
}
