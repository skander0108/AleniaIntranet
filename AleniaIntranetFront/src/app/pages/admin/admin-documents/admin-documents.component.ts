import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { DocumentService } from '../../../core/services/document.service';
import { AuthService } from '../../../core/services/auth.service';

@Component({
    selector: 'app-admin-documents',
    standalone: true,
    imports: [CommonModule, RouterModule, ReactiveFormsModule],
    templateUrl: './admin-documents.component.html',
    styleUrls: ['./admin-documents.component.scss']
})
export class AdminDocumentsComponent implements OnInit {
    uploadForm: FormGroup;
    selectedFile: File | null = null;

    isSubmitting = false;
    submitted = false;

    errorMessage = '';
    successMessage = '';

    isAdmin = false;
    isManager = false;

    categories = [
        'Company Policies',
        'Forms & Templates',
        'IT & Security',
        'Training Materials',
        'HR & Benefits',
        'Legal & Compliance',
        'Project Documentation',
        'Other'
    ];

    constructor(
        private fb: FormBuilder,
        private documentService: DocumentService,
        private authService: AuthService,
        private router: Router
    ) {
        this.uploadForm = this.fb.group({
            title: ['', Validators.required],
            category: ['', Validators.required],
            accessLevel: ['ALL', Validators.required],
            department: ['']
        });
    }

    ngOnInit(): void {
        const roles = this.authService.getUserRoles();
        this.isAdmin = roles.includes('ROLE_ADMIN');
        this.isManager = roles.includes('ROLE_MANAGER');
    }

    onFileSelected(event: any): void {
        const file = event.target.files[0];
        if (file) {
            // Validate file size (e.g., max 15MB)
            if (file.size > 15 * 1024 * 1024) {
                this.errorMessage = 'File size exceeds 15MB limit.';
                this.selectedFile = null;
                return;
            }
            this.selectedFile = file;
            this.errorMessage = '';

            // Auto-fill title if empty
            if (!this.uploadForm.get('title')?.value) {
                const titleWithoutExt = file.name.substring(0, file.name.lastIndexOf('.')) || file.name;
                this.uploadForm.patchValue({ title: titleWithoutExt });
            }
        }
    }

    onSubmit(): void {
        this.submitted = true;
        this.errorMessage = '';
        this.successMessage = '';

        if (this.uploadForm.invalid || !this.selectedFile) {
            return;
        }

        this.isSubmitting = true;

        const formData = new FormData();
        formData.append('file', this.selectedFile);
        formData.append('title', this.uploadForm.get('title')?.value);
        formData.append('category', this.uploadForm.get('category')?.value);
        formData.append('accessLevel', this.uploadForm.get('accessLevel')?.value);

        if (this.uploadForm.get('department')?.value) {
            formData.append('department', this.uploadForm.get('department')?.value);
        }

        this.documentService.uploadDocument(formData).subscribe({
            next: (res) => {
                this.isSubmitting = false;
                this.successMessage = 'Document uploaded successfully!';

                setTimeout(() => {
                    this.router.navigate(['/documents']);
                }, 1500);
            },
            error: (err) => {
                console.error('Upload failed', err);
                this.errorMessage = 'Failed to upload document. Please try again or check console.';
                this.isSubmitting = false;
            }
        });
    }

    getFileIcon(contentType: string): string {
        if (!contentType) return 'description'; // default
        if (contentType.includes('pdf')) return 'picture_as_pdf';
        if (contentType.includes('word') || contentType.includes('document')) return 'description';
        if (contentType.includes('excel') || contentType.includes('spreadsheet')) return 'table_view';
        if (contentType.includes('powerpoint') || contentType.includes('presentation')) return 'slideshow';
        if (contentType.includes('image')) return 'image';
        if (contentType.includes('zip') || contentType.includes('compressed')) return 'folder_zip';
        return 'insert_drive_file';
    }
}
