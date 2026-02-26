import { Component, OnInit, inject, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { AnnouncementService } from '../../../core/services/announcement.service';
import { FileService } from '../../../core/services/file.service';

@Component({
  selector: 'app-announcement-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  templateUrl: './announcement-form.html',
  styleUrl: './announcement-form.css',
})
export class AnnouncementForm implements OnInit {
  fb = inject(FormBuilder);
  announcementService = inject(AnnouncementService);
  fileService = inject(FileService);
  router = inject(Router);
  route = inject(ActivatedRoute);
  private cdr = inject(ChangeDetectorRef);

  form: FormGroup = this.fb.group({
    title: ['', Validators.required],
    content: ['', Validators.required],
    summary: [''],
    status: ['DRAFT', Validators.required],
    priority: ['NORMAL'],
    targetAudience: ['ALL'],
    imageUrl: [''],
    category: ['NEWS']
  });

  isEditMode = false;
  announcementId: string | null = null;
  loading = false;
  uploading = false;
  error = '';

  ngOnInit() {
    this.announcementId = this.route.snapshot.paramMap.get('id');
    if (this.announcementId) {
      this.isEditMode = true;
      this.loadAnnouncement(this.announcementId);
    }
  }

  loadAnnouncement(id: string) {
    this.loading = true;
    this.announcementService.get(id).subscribe({
      next: (data) => {
        this.form.patchValue(data);
        this.loading = false;
        this.cdr.detectChanges();
      },
      error: (err) => {
        this.error = 'Failed to load announcement';
        this.loading = false;
        this.cdr.detectChanges();
      }
    });
  }

  onFileSelected(event: any) {
    const file: File = event.target.files[0];
    if (file) {
      this.uploading = true;
      this.fileService.upload(file).subscribe({
        next: (response) => {
          this.form.patchValue({ imageUrl: response.url });
          this.uploading = false;
          this.cdr.detectChanges();
        },
        error: (err) => {
          this.error = 'Failed to upload image';
          this.uploading = false;
          this.cdr.detectChanges();
        }
      });
    }
  }

  onSubmit() {
    if (this.form.invalid) return;

    this.loading = true;
    const announcement = this.form.value;

    const request = this.isEditMode
      ? this.announcementService.update(this.announcementId!, announcement)
      : this.announcementService.create(announcement);

    request.subscribe({
      next: () => {
        this.router.navigate(['/manager']);
      },
      error: (err) => {
        this.error = 'Failed to save announcement';
        this.loading = false;
        this.cdr.detectChanges();
      }
    });
  }

  get previewImageUrl(): string | null {
    const url = this.form.get('imageUrl')?.value;
    if (!url) return null;
    if (url.startsWith('http') || url.startsWith('/api/') || url.startsWith('assets/')) {
      return url;
    }
    return '/api/files/' + url;
  }
}
