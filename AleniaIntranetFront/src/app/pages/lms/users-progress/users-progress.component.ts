import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { LmsService, LmsUserCourseProgressDto, Page } from '../../../core/services/lms.service';

@Component({
    selector: 'app-users-progress',
    standalone: true,
    imports: [CommonModule, FormsModule],
    templateUrl: './users-progress.component.html',
    styleUrls: []
})
export class UsersProgressComponent implements OnInit {
    allData: LmsUserCourseProgressDto[] = [];
    filteredData: LmsUserCourseProgressDto[] = [];
    data: LmsUserCourseProgressDto[] = [];
    loading = true;

    // Pagination states
    currentPage = 0;
    pageSize = 10;
    totalElements = 0;
    totalPages = 0;

    // Search state
    searchTerm: string = '';

    constructor(private lmsService: LmsService, private cdr: ChangeDetectorRef) { }

    ngOnInit(): void {
        this.fetchAllData();
    }

    fetchAllData(): void {
        this.loading = true;
        // Fetch all records at once by requesting a large size
        this.lmsService.getPaginatedUsersProgress(0, 10000, '').subscribe({
            next: (response: Page<LmsUserCourseProgressDto>) => {
                this.allData = response.content;
                this.applyFiltersAndPagination();
                this.loading = false;
                this.cdr.detectChanges();
            },
            error: (err) => {
                console.error('Failed to load LMS users progress:', err);
                this.loading = false;
                this.cdr.detectChanges();
            }
        });
    }

    applyFiltersAndPagination(): void {
        // 1. Filter
        if (this.searchTerm && this.searchTerm.trim() !== '') {
            const lowerSearch = this.searchTerm.toLowerCase();
            this.filteredData = this.allData.filter(item =>
                (item.userFullName && item.userFullName.toLowerCase().includes(lowerSearch)) ||
                (item.email && item.email.toLowerCase().includes(lowerSearch)) ||
                (item.courseTitle && item.courseTitle.toLowerCase().includes(lowerSearch)) ||
                (item.courseType && item.courseType.toLowerCase().includes(lowerSearch))
            );
        } else {
            this.filteredData = [...this.allData];
        }

        // 2. Setup Pagination Metadata
        this.totalElements = this.filteredData.length;
        this.totalPages = Math.ceil(this.totalElements / this.pageSize);
        if (this.currentPage >= this.totalPages) {
            this.currentPage = Math.max(0, this.totalPages - 1);
        }

        // 3. Slice Data for current page
        const start = this.currentPage * this.pageSize;
        const end = Math.min(start + this.pageSize, this.totalElements);
        this.data = this.filteredData.slice(start, end);

        this.cdr.detectChanges();
    }

    changePage(newPage: number): void {
        if (newPage >= 0 && newPage < this.totalPages) {
            this.currentPage = newPage;
            this.applyFiltersAndPagination();
        }
    }

    onSearch(): void {
        this.currentPage = 0; // Reset to first page
        this.applyFiltersAndPagination();
    }

    filterByUser(email: string): void {
        if (email) {
            this.searchTerm = email;
            this.onSearch();
        }
    }

    min(a: number, b: number): number {
        return Math.min(a, b);
    }
}
