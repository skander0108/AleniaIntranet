import { Component, OnInit, inject, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink, ActivatedRoute } from '@angular/router';
import { EventService } from '../../../core/services/event.service';
import { FileService } from '../../../core/services/file.service';

@Component({
  selector: 'app-event-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  templateUrl: './event-form.html',
  styleUrl: './event-form.css',
})
export class EventForm implements OnInit {
  fb = inject(FormBuilder);
  eventService = inject(EventService);
  fileService = inject(FileService);
  router = inject(Router);
  route = inject(ActivatedRoute);
  private cdr = inject(ChangeDetectorRef);

  form: FormGroup = this.fb.group({
    title: ['', Validators.required],
    description: ['', Validators.required],
    imageUrl: [''],
    eventDate: ['', Validators.required],
    eventTime: ['', Validators.required],
    location: ['', Validators.required]
  });

  loading = false;
  uploading = false;
  error = '';
  isEditMode = false;
  eventId: string | null = null;

  ngOnInit() {
    this.eventId = this.route.snapshot.paramMap.get('id');
    if (this.eventId) {
      this.isEditMode = true;
      this.loadEvent(this.eventId);
    }
  }

  loadEvent(id: string) {
    this.loading = true;
    this.eventService.getEvent(id).subscribe({
      next: (event) => {
        this.form.patchValue({
          title: event.title,
          description: event.description,
          imageUrl: event.imageUrl,
          eventDate: event.eventDate, // Ensure format matches input type="date"
          eventTime: event.eventTime, // Ensure format matches input type="time"
          location: event.location
        });
        this.loading = false;
        this.cdr.detectChanges();
      },
      error: (err) => {
        this.error = 'Failed to load event';
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
    const eventData = this.form.value;

    const request$ = this.isEditMode && this.eventId
      ? this.eventService.updateEvent(this.eventId, eventData)
      : this.eventService.createEvent(eventData);

    request$.subscribe({
      next: () => {
        this.router.navigate(['/hr']);
      },
      error: (err) => {
        this.error = this.isEditMode ? 'Failed to update event' : 'Failed to create event';
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

