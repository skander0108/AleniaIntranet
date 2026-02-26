import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { NewJoinerService } from '../../../core/services/new-joiner.service';
import { NewJoiner } from '../../../core/models/new-joiner.model';

import { RouterLink } from '@angular/router';

@Component({
    selector: 'app-joiner-management',
    standalone: true,
    imports: [CommonModule, ReactiveFormsModule, RouterLink],
    templateUrl: './joiner-management.component.html'
})
export class JoinerManagementComponent implements OnInit {
    joiners: NewJoiner[] = [];
    joinerForm: FormGroup;
    isModalOpen = false;
    isEditing = false;
    currentJoinerId: string | null = null;
    selectedFile: File | undefined;
    selectedCv: File | undefined;
    isSaving = false;

    // Math for template
    Math = Math;

    // Pagination
    currentPage = 0;
    pageSize = 10;
    totalPages = 0;
    totalElements = 0;

    constructor(
        private newJoinerService: NewJoinerService,
        private fb: FormBuilder,
        private cdr: ChangeDetectorRef
    ) {
        this.joinerForm = this.fb.group({
            fullName: ['', Validators.required],
            jobTitle: ['', Validators.required],
            department: ['', Validators.required],
            startDate: ['', Validators.required],
            location: ['']
        });
    }

    ngOnInit() {
        this.loadJoiners();
    }

    loadJoiners() {
        this.newJoinerService.getAll(this.currentPage, this.pageSize).subscribe((response) => {
            this.joiners = (response.content || []).map((j: NewJoiner) => ({
                ...j,
                photoUrl: this.formatImageUrl(j.photoUrl)
            }));
            this.totalPages = response.totalPages;
            this.totalElements = response.totalElements;
            this.cdr.detectChanges();
        });
    }

    changePage(page: number) {
        if (page >= 0 && page < this.totalPages) {
            this.currentPage = page;
            this.loadJoiners();
        }
    }

    openModal(joiner?: NewJoiner) {
        this.isModalOpen = true;
        this.isEditing = !!joiner;
        this.currentJoinerId = joiner ? joiner.id : null;
        this.selectedFile = undefined;

        if (joiner) {
            this.joinerForm.patchValue({
                fullName: joiner.fullName,
                jobTitle: joiner.jobTitle,
                department: joiner.department,
                startDate: joiner.startDate,
                location: joiner.location
            });
        } else {
            this.joinerForm.reset();
        }
    }

    closeModal() {
        this.isModalOpen = false;
        this.joinerForm.reset();
    }

    onFileSelected(event: any) {
        const file = event.target.files[0];
        if (file) {
            if (file.size > 2 * 1024 * 1024) {
                alert('File size must be less than 2MB');
                return;
            }
            this.selectedFile = file;
        }
    }

    onCvSelected(event: any) {
        const file = event.target.files[0];
        if (file) {
            if (file.size > 10 * 1024 * 1024) {
                alert('File size must be less than 10MB');
                return;
            }
            this.selectedCv = file;
        }
    }

    saveJoiner() {
        if (this.joinerForm.invalid) return;

        this.isSaving = true;
        const formValue = this.joinerForm.value;

        const request = this.isEditing && this.currentJoinerId
            ? this.newJoinerService.update(this.currentJoinerId, formValue, this.selectedFile, this.selectedCv)
            : this.newJoinerService.create(formValue, this.selectedFile, this.selectedCv);

        request.subscribe({
            next: () => {
                this.isSaving = false;
                this.closeModal();
                this.loadJoiners();
            },
            error: (err: any) => {
                console.error('Error saving joiner', err);
                this.isSaving = false;
                alert('Failed to save joiner. Please try again.');
            }
        });
    }

    deleteJoiner(id: string) {
        if (confirm('Are you sure you want to delete this joiner?')) {
            this.newJoinerService.delete(id).subscribe(() => {
                this.loadJoiners();
            });
        }
    }

    private formatImageUrl(url: string | null | undefined): string | undefined {
        if (!url) return undefined;
        if (url.startsWith('http') || url.startsWith('/api/') || url.startsWith('assets/')) {
            return url;
        }
        return '/api/files/' + url;
    }
}
