import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { NewJoinerService } from '../../core/services/new-joiner.service';
import { NewJoiner } from '../../core/models/new-joiner.model';

@Component({
    selector: 'app-new-joiners',
    standalone: true,
    imports: [CommonModule, RouterModule],
    templateUrl: './new-joiners.component.html',
    styleUrl: './new-joiners.component.css'
})
export class NewJoinersComponent implements OnInit {
    joiners: NewJoiner[] = [];
    loading = true;

    constructor(
        private newJoinerService: NewJoinerService,
        private cdr: ChangeDetectorRef
    ) { }

    ngOnInit() {
        this.loadJoiners();
    }

    loadJoiners() {
        this.newJoinerService.getAll(0, 5).subscribe({
            next: (response) => {
                this.joiners = (response.content || []).map((j: NewJoiner) => ({
                    ...j,
                    photoUrl: this.formatImageUrl(j.photoUrl)
                }));
                this.loading = false;
                this.cdr.detectChanges(); // Fix NG0100 error
            },
            error: () => {
                this.loading = false;
                this.cdr.detectChanges();
            }
        });
    }

    private formatImageUrl(url: string | null | undefined): string | undefined {
        if (!url) return undefined;
        if (url.startsWith('http') || url.startsWith('/api/') || url.startsWith('assets/')) {
            return url;
        }
        return '/api/files/' + url;
    }
}
