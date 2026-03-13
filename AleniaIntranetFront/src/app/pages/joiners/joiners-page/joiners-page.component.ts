import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { ReactiveFormsModule, FormControl, FormGroup, FormBuilder, Validators } from '@angular/forms';
import { debounceTime, distinctUntilChanged } from 'rxjs';
import { NewJoinerService } from '../../../core/services/new-joiner.service';
import { NewJoiner } from '../../../core/models/new-joiner.model';
import { AuthService } from '../../../core/services/auth.service';
import { OrgNode } from '../../../core/models/org-chart.model';
import { ORG_CHART_DATA, DEPARTMENTS } from '../../org-chart/org-chart-data';

@Component({
    selector: 'app-joiners-page',
    standalone: true,
    imports: [CommonModule, RouterLink, ReactiveFormsModule],
    templateUrl: './joiners-page.component.html'
})
export class JoinersPageComponent implements OnInit {
    joiners: NewJoiner[] = [];
    totalElements = 0;
    totalPages = 0;
    currentPage = 0;
    pageSize = 12;

    searchControl = new FormControl('');
    departmentControl = new FormControl('');

    locations = ['Madrid', 'Lisbon', 'London', 'Remote'];
    currentLocation: string | null = null;
    departments = DEPARTMENTS.filter(d => d !== 'All Departments');

    isHR = false;

    // Org Chart Employees
    allOrgEmployees: OrgNode[] = [];
    filteredOrgEmployees: OrgNode[] = [];
    selectedOrgEmployee: OrgNode | null = null;
    private parentMap = new Map<string, OrgNode>();

    // Details Modal
    selectedJoiner: NewJoiner | null = null;

    // Form Modal
    isFormModalOpen = false;
    editingJoiner: NewJoiner | null = null;
    joinerForm: FormGroup;
    isSaving = false;
    selectedPhoto: File | undefined;
    selectedCv: File | undefined;

    constructor(
        private newJoinerService: NewJoinerService,
        private authService: AuthService,
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

    ngOnInit(): void {
        this.isHR = this.authService.hasRole('HR') || this.authService.hasRole('ROLE_HR');
        this.loadJoiners();
        this.loadOrgEmployees();

        // Setup search debounce
        this.searchControl.valueChanges.pipe(
            debounceTime(300),
            distinctUntilChanged()
        ).subscribe(() => {
            this.currentPage = 0;
            this.loadJoiners();
            this.filterOrgEmployees();
        });

        this.departmentControl.valueChanges.pipe(
            debounceTime(300),
            distinctUntilChanged()
        ).subscribe(() => {
            this.currentPage = 0;
            this.loadJoiners();
            this.filterOrgEmployees();
        });
    }

    // --- Org Chart Employees ---

    private loadOrgEmployees(): void {
        this.allOrgEmployees = [];
        this.flattenTree(ORG_CHART_DATA, null);
        this.filterOrgEmployees();
    }

    private flattenTree(node: OrgNode, parent: OrgNode | null): void {
        this.allOrgEmployees.push(node);
        if (parent) {
            this.parentMap.set(node.id, parent);
        }
        for (const child of node.children || []) {
            this.flattenTree(child, node);
        }
    }

    filterOrgEmployees(): void {
        const query = (this.searchControl.value || '').toLowerCase();
        const dept = this.departmentControl.value || '';

        this.filteredOrgEmployees = this.allOrgEmployees.filter(emp => {
            const matchesQuery = !query ||
                emp.fullName.toLowerCase().includes(query) ||
                emp.title.toLowerCase().includes(query) ||
                emp.department.toLowerCase().includes(query);
            const matchesDept = !dept || emp.department === dept;
            return matchesQuery && matchesDept;
        });
    }

    getOrgPhotoUrl(emp: OrgNode): string {
        return emp.avatarUrl
            ? `url('${emp.avatarUrl}')`
            : `url('https://ui-avatars.com/api/?name=${encodeURIComponent(emp.fullName)}&background=random')`;
    }

    getManagerOf(emp: OrgNode): OrgNode | null {
        return this.parentMap.get(emp.id) || null;
    }

    openOrgDetailModal(emp: OrgNode): void {
        this.selectedOrgEmployee = emp;
        this.selectedJoiner = null;
    }

    closeOrgDetailModal(): void {
        this.selectedOrgEmployee = null;
    }

    navigateToOrgEmployee(emp: OrgNode): void {
        this.selectedOrgEmployee = emp;
    }

    loadJoiners(): void {
        // TODO: Update service to accept search params if backend supports it.
        // For now, we fetch all and filter client-side or just fetch paginated.
        // The current backend endpoint is simple pagination.
        // Implementing client-side filter for demo if backend doesn't support q=

        this.newJoinerService.getAll(this.currentPage, this.pageSize).subscribe(response => {
            this.joiners = response.content;
            this.totalElements = response.totalElements;
            this.totalPages = response.totalPages;
            this.cdr.markForCheck();
        });
    }

    changePage(page: number): void {
        if (page >= 0 && page < this.totalPages) {
            this.currentPage = page;
            this.loadJoiners();
        }
    }

    filterLocation(location: string | null): void {
        this.currentLocation = location;
        // In real app, pass location to API
        // For now, reload (logic to be improved with backend support)
        this.loadJoiners();
    }

    getPhotoUrl(joiner: NewJoiner): string {
        return joiner.photoUrl
            ? `url('${this.formatImageUrl(joiner.photoUrl)}')`
            : `url('https://ui-avatars.com/api/?name=${encodeURIComponent(joiner.fullName)}&background=random')`;
    }

    private formatImageUrl(url: string | null | undefined): string | undefined {
        if (!url) return undefined;
        if (url.startsWith('http') || url.startsWith('/api/') || url.startsWith('assets/')) {
            return url;
        }
        return '/api/files/' + url;
    }

    // Details Modal
    openDetailModal(joiner: NewJoiner): void {
        this.selectedJoiner = joiner;
    }

    closeDetailModal(): void {
        this.selectedJoiner = null;
    }

    downloadCv(id: string, fileName?: string): void {
        this.newJoinerService.downloadCv(id).subscribe(blob => {
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = fileName || 'cv.pdf';
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            window.URL.revokeObjectURL(url);
        });
    }

    // Form Modal
    openFormModal(joiner?: NewJoiner): void {
        this.isFormModalOpen = true;
        this.editingJoiner = joiner || null;
        this.selectedPhoto = undefined;
        this.selectedCv = undefined;

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
            this.joinerForm.patchValue({ location: '' });
        }
    }

    closeFormModal(): void {
        this.isFormModalOpen = false;
        this.editingJoiner = null;
    }

    onPhotoSelected(event: any): void {
        const file = event.target.files[0];
        if (file) this.selectedPhoto = file;
    }

    onCvSelected(event: any): void {
        const file = event.target.files[0];
        if (file) {
            if (file.size > 10 * 1024 * 1024) { // 10MB
                alert('File size must be less than 10MB');
                return;
            }
            this.selectedCv = file;
        }
    }

    saveJoiner(): void {
        if (this.joinerForm.invalid) return;

        this.isSaving = true;
        const formValue = this.joinerForm.value;

        const request = this.editingJoiner
            ? this.newJoinerService.update(this.editingJoiner.id, formValue, this.selectedPhoto, this.selectedCv)
            : this.newJoinerService.create(formValue, this.selectedPhoto, this.selectedCv);

        request.subscribe({
            next: () => {
                this.isSaving = false;
                this.closeFormModal();
                this.loadJoiners();
                // Show toast?
            },
            error: (err) => {
                console.error('Error', err);
                this.isSaving = false;
                alert('An error occurred. Please try again.');
            }
        });
    }
}
