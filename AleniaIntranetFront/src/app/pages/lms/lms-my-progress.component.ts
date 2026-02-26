import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { LmsService, LmsProgressDto } from '../../core/services/lms.service';

@Component({
    selector: 'app-lms-my-progress',
    standalone: true,
    imports: [CommonModule],
    template: `
        <div class="p-6 max-w-7xl mx-auto space-y-6">
            <!-- Header -->
            <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white/50 dark:bg-gray-800/50 backdrop-blur-md p-6 rounded-2xl border border-white/20 dark:border-gray-700/50 shadow-sm">
                <div>
                    <h1 class="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-indigo-600 to-purple-600 dark:from-indigo-400 dark:to-purple-400">My Learning Journey</h1>
                    <p class="text-sm text-gray-500 dark:text-gray-400 mt-2 font-medium">Track your course completions, scores, and personal growth</p>
                </div>
                <button *ngIf="progressData.length > 0"
                    (click)="exportCsv()"
                    class="group relative inline-flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-xl hover:from-indigo-700 hover:to-purple-700 transition-all duration-300 shadow-md hover:shadow-lg hover:-translate-y-0.5 text-sm font-semibold overflow-hidden">
                    <div class="absolute inset-0 bg-white/20 group-hover:translate-x-full -translate-x-full transition-transform duration-500 ease-in-out skew-x-12"></div>
                    <span class="material-symbols-outlined text-[20px]">download</span>
                    <span class="relative z-10">Export Report</span>
                </button>
            </div>

            <!-- Loading state -->
            <div *ngIf="loading" class="flex flex-col items-center justify-center py-32 space-y-4">
                <div class="animate-spin rounded-full h-12 w-12 border-4 border-indigo-100 border-t-indigo-600 dark:border-gray-700 dark:border-t-indigo-500 shadow-lg"></div>
                <p class="text-indigo-600 dark:text-indigo-400 font-medium animate-pulse">Syncing learning data...</p>
            </div>

            <ng-container *ngIf="!loading">
                <!-- Empty state -->
                <div *ngIf="progressData.length === 0" class="flex flex-col items-center justify-center py-24 px-4 bg-white/40 dark:bg-gray-800/40 backdrop-blur-sm rounded-3xl border border-dashed border-gray-300 dark:border-gray-700">
                    <div class="p-6 bg-indigo-50 dark:bg-indigo-900/30 rounded-full mb-6 relative group">
                        <div class="absolute inset-0 bg-indigo-200 dark:bg-indigo-800 rounded-full blur-xl opacity-50 group-hover:opacity-75 transition-opacity duration-500"></div>
                        <span class="material-symbols-outlined text-6xl text-indigo-500 dark:text-indigo-400 relative z-10 block transition-transform duration-500 group-hover:scale-110">school</span>
                    </div>
                    <h3 class="text-xl font-bold text-gray-900 dark:text-white mb-2">Ready to start learning?</h3>
                    <p class="text-center text-gray-500 dark:text-gray-400 max-w-sm">Your course progress will magically appear here once synced from iSpring Learn.</p>
                </div>

                <div *ngIf="progressData.length > 0" class="space-y-6 animate-fade-in-up">
                    <!-- Stats cards -->
                    <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <!-- Total Courses Card -->
                        <div class="group bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-sm hover:shadow-xl transition-all duration-300 border border-gray-100 dark:border-gray-700 relative overflow-hidden">
                            <div class="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity duration-300 transform group-hover:scale-110 group-hover:rotate-12">
                                <span class="material-symbols-outlined text-8xl text-blue-600">menu_book</span>
                            </div>
                            <div class="relative z-10 flex items-start justify-between">
                                <div>
                                    <p class="text-sm font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-1">Total Courses</p>
                                    <p class="text-4xl font-extrabold text-gray-900 dark:text-white">{{ progressData.length }}</p>
                                </div>
                                <div class="p-3 bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-900/40 dark:to-indigo-900/40 rounded-xl shadow-inner border border-blue-100/50 dark:border-blue-800/50">
                                    <span class="material-symbols-outlined text-blue-600 dark:text-blue-400">library_books</span>
                                </div>
                            </div>
                            <div class="mt-4 w-full bg-gray-100 dark:bg-gray-700 rounded-full h-1.5 overflow-hidden">
                                <div class="bg-blue-500 h-1.5 rounded-full" style="width: 100%"></div>
                            </div>
                        </div>

                        <!-- Completed Card -->
                        <div class="group bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-sm hover:shadow-xl transition-all duration-300 border border-gray-100 dark:border-gray-700 relative overflow-hidden">
                            <div class="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity duration-300 transform group-hover:scale-110 group-hover:-rotate-12">
                                <span class="material-symbols-outlined text-8xl text-emerald-600">check_circle</span>
                            </div>
                            <div class="relative z-10 flex items-start justify-between">
                                <div>
                                    <p class="text-sm font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-1">Mastered</p>
                                    <p class="text-4xl font-extrabold text-gray-900 dark:text-white">{{ completedCount }}</p>
                                </div>
                                <div class="p-3 bg-gradient-to-br from-emerald-50 to-green-50 dark:from-emerald-900/40 dark:to-green-900/40 rounded-xl shadow-inner border border-emerald-100/50 dark:border-emerald-800/50">
                                    <span class="material-symbols-outlined text-emerald-600 dark:text-emerald-400">workspace_premium</span>
                                </div>
                            </div>
                            <div class="mt-4 w-full bg-gray-100 dark:bg-gray-700 rounded-full h-1.5 overflow-hidden">
                                <div class="bg-emerald-500 h-1.5 rounded-full transition-all duration-1000 ease-out" [style.width.%]="(completedCount / progressData.length) * 100"></div>
                            </div>
                        </div>

                        <!-- In Progress Card -->
                        <div class="group bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-sm hover:shadow-xl transition-all duration-300 border border-gray-100 dark:border-gray-700 relative overflow-hidden">
                            <div class="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity duration-300 transform group-hover:translate-x-2 group-hover:-translate-y-2">
                                <span class="material-symbols-outlined text-8xl text-amber-600">trending_up</span>
                            </div>
                            <div class="relative z-10 flex items-start justify-between">
                                <div>
                                    <p class="text-sm font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-1">In Progress</p>
                                    <p class="text-4xl font-extrabold text-gray-900 dark:text-white">{{ inProgressCount }}</p>
                                </div>
                                <div class="p-3 bg-gradient-to-br from-amber-50 to-orange-50 dark:from-amber-900/40 dark:to-orange-900/40 rounded-xl shadow-inner border border-amber-100/50 dark:border-amber-800/50">
                                    <span class="material-symbols-outlined text-amber-600 dark:text-amber-400">directions_run</span>
                                </div>
                            </div>
                            <div class="mt-4 w-full bg-gray-100 dark:bg-gray-700 rounded-full h-1.5 overflow-hidden">
                                <div class="bg-amber-500 h-1.5 rounded-full transition-all duration-1000 ease-out relative overflow-hidden" [style.width.%]="(inProgressCount / progressData.length) * 100">
                                    <div class="absolute inset-0 bg-white/30 w-full animate-[shimmer_2s_infinite]"></div>
                                </div>
                            </div>
                        </div>
                    </div>

                    <!-- Progress table -->
                    <div class="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
                        <div class="px-6 py-5 border-b border-gray-100 dark:border-gray-700 bg-gray-50/50 dark:bg-gray-800/50">
                            <h3 class="text-lg font-bold text-gray-900 dark:text-white flex items-center gap-2">
                                <span class="material-symbols-outlined text-indigo-500">list_alt</span>
                                Course Details
                            </h3>
                        </div>
                        <div class="overflow-x-auto">
                            <table class="w-full text-left border-collapse">
                                <thead>
                                    <tr class="bg-white dark:bg-gray-800 border-b border-gray-100 dark:border-gray-700">
                                        <th class="px-6 py-4 text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider whitespace-nowrap">Course Name</th>
                                        <th class="px-6 py-4 text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider whitespace-nowrap border-l border-gray-100 dark:border-gray-700/50 bg-gray-50/30 dark:bg-gray-800/30">Status</th>
                                        <th class="px-6 py-4 text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider whitespace-nowrap text-center">Score</th>
                                        <th class="px-6 py-4 text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider whitespace-nowrap text-right">Date Completed</th>
                                    </tr>
                                </thead>
                                <tbody class="divide-y divide-gray-50 dark:divide-gray-700/50">
                                    <tr *ngFor="let item of progressData; let i = index"
                                        class="group hover:bg-indigo-50/30 dark:hover:bg-indigo-900/10 transition-colors duration-200">
                                        <td class="px-6 py-4">
                                            <div class="flex items-center gap-4">
                                                <div class="w-12 h-12 rounded-xl bg-gray-100 dark:bg-gray-700 flex items-center justify-center text-gray-500 dark:text-gray-400 group-hover:bg-indigo-100 group-hover:text-indigo-600 dark:group-hover:bg-indigo-900/50 dark:group-hover:text-indigo-400 transition-colors shadow-sm border border-gray-200 dark:border-gray-600">
                                                    <span class="material-symbols-outlined text-[24px]">{{ item.courseType === 'video' ? 'play_circle' : item.courseType === 'quiz' ? 'quiz' : 'menu_book' }}</span>
                                                </div>
                                                <div>
                                                    <p class="text-sm font-bold text-gray-900 dark:text-white group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">{{ item.courseTitle }}</p>
                                                    <span class="inline-flex mt-1 items-center px-2 py-0.5 rounded text-[10px] font-semibold bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 uppercase tracking-wide">
                                                        {{ item.courseType || 'Standard' }}
                                                    </span>
                                                </div>
                                            </div>
                                        </td>
                                        <td class="px-6 py-4 border-l border-gray-100 dark:border-gray-700/50 bg-gray-50/30 dark:bg-gray-800/30 group-hover:bg-transparent transition-colors">
                                            <span [class]="getStatusClass(item.status)"
                                                  class="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold shadow-sm whitespace-nowrap border">
                                                <span class="w-1.5 h-1.5 rounded-full" [class.bg-current]="true"></span>
                                                {{ item.status.replace('_', ' ') }}
                                            </span>
                                        </td>
                                        <td class="px-6 py-4 text-center">
                                            <div *ngIf="item.score !== null && item.maxScore !== null">
                                                <div class="inline-flex items-center justify-center p-1 px-2.5 rounded bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 shadow-sm">
                                                    <span class="text-sm font-bold" [ngClass]="{'text-emerald-600 dark:text-emerald-400': (item.score! / item.maxScore!) >= 0.8, 'text-amber-600 dark:text-amber-400': (item.score! / item.maxScore!) >= 0.5 && (item.score! / item.maxScore!) < 0.8, 'text-red-500': (item.score! / item.maxScore!) < 0.5}">
                                                        {{ item.score }}
                                                    </span>
                                                    <span class="text-[10px] text-gray-400 mx-0.5">/</span>
                                                    <span class="text-[10px] font-medium text-gray-500">{{ item.maxScore }}</span>
                                                </div>
                                            </div>
                                            <span *ngIf="item.score === null" class="text-gray-300 dark:text-gray-600 font-bold">—</span>
                                        </td>
                                        <td class="px-6 py-4 text-right text-sm font-medium text-gray-600 dark:text-gray-400">
                                            {{ item.completionDate ? (item.completionDate | date:'mediumDate') : '—' }}
                                        </td>
                                    </tr>
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            </ng-container>
        </div>
    `
})
export class LmsMyProgressComponent implements OnInit {
    progressData: LmsProgressDto[] = [];
    loading = true;
    completedCount = 0;
    inProgressCount = 0;

    constructor(private lmsService: LmsService, private cdr: ChangeDetectorRef) { }

    ngOnInit(): void {
        this.lmsService.getMyProgress().subscribe({
            next: (data) => {
                this.progressData = data;
                this.completedCount = data.filter(d => d.status === 'COMPLETED').length;
                this.inProgressCount = data.filter(d => d.status === 'IN_PROGRESS').length;
                this.loading = false;
                this.cdr.detectChanges();
            },
            error: () => {
                this.loading = false;
                this.cdr.detectChanges();
            }
        });
    }

    getStatusClass(status: string): string {
        switch (status) {
            case 'COMPLETED': return 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400';
            case 'IN_PROGRESS': return 'bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400';
            case 'NOT_STARTED': return 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400';
            default: return 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400';
        }
    }

    exportCsv(): void {
        this.lmsService.exportCsv(this.progressData, 'my-progress.csv');
    }
}
