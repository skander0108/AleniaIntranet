import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { LmsService, LmsProgressDto } from '../../core/services/lms.service';

@Component({
    selector: 'app-lms-team-progress',
    standalone: true,
    imports: [CommonModule],
    template: `
        <div class="p-6 max-w-7xl mx-auto space-y-6">
            <!-- Header -->
            <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white/50 dark:bg-gray-800/50 backdrop-blur-md p-6 rounded-2xl border border-white/20 dark:border-gray-700/50 shadow-sm">
                <div class="flex items-center gap-4">
                    <div class="p-3 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl shadow-lg shadow-indigo-500/30">
                        <span class="material-symbols-outlined text-white text-3xl">groups</span>
                    </div>
                    <div>
                        <h1 class="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-gray-900 to-gray-600 dark:from-white dark:to-gray-300">Team Learning Progress</h1>
                        <p class="text-sm text-gray-500 dark:text-gray-400 mt-1 font-medium">Monitor your team members' course completions and performance</p>
                    </div>
                </div>
                <button *ngIf="progressData.length > 0"
                    (click)="exportCsv()"
                    class="group relative inline-flex items-center gap-2 px-5 py-2.5 bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-200 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-700 border border-gray-200 dark:border-gray-600 transition-all duration-300 shadow-sm hover:shadow-md text-sm font-semibold overflow-hidden">
                    <span class="material-symbols-outlined text-[20px] text-indigo-600 dark:text-indigo-400 group-hover:-translate-y-0.5 transition-transform">download</span>
                    <span>Export Report</span>
                </button>
            </div>

            <!-- Loading state -->
            <div *ngIf="loading" class="flex flex-col items-center justify-center py-32 space-y-4">
                <div class="animate-spin rounded-full h-12 w-12 border-4 border-indigo-100 border-t-indigo-600 dark:border-gray-700 dark:border-t-indigo-500 shadow-lg"></div>
                <p class="text-indigo-600 dark:text-indigo-400 font-medium animate-pulse">Gathering team data...</p>
            </div>

            <ng-container *ngIf="!loading">
                <!-- Empty state -->
                <div *ngIf="progressData.length === 0" class="flex flex-col items-center justify-center py-24 px-4 bg-white/40 dark:bg-gray-800/40 backdrop-blur-sm rounded-3xl border border-dashed border-gray-300 dark:border-gray-700">
                    <div class="p-6 bg-gray-50 dark:bg-gray-800/50 rounded-full mb-6 relative group">
                        <span class="material-symbols-outlined text-6xl text-gray-400 dark:text-gray-500 relative z-10 block transition-transform duration-500 group-hover:scale-110">engineering</span>
                    </div>
                    <h3 class="text-xl font-bold text-gray-900 dark:text-white mb-2">No team data available</h3>
                    <p class="text-center text-gray-500 dark:text-gray-400 max-w-sm">Your team's progress will appear here once they start learning and data is synced.</p>
                </div>

                <div *ngIf="progressData.length > 0" class="space-y-6 animate-fade-in-up">
                    <!-- Stats -->
                    <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                        <div class="bg-white dark:bg-gray-800 rounded-2xl p-5 shadow-sm border border-gray-100 dark:border-gray-700 hover:shadow-md transition-shadow">
                            <div class="flex items-center gap-4">
                                <div class="p-3 bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 rounded-xl">
                                    <span class="material-symbols-outlined">person_search</span>
                                </div>
                                <div>
                                    <p class="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Team Members</p>
                                    <p class="text-2xl font-bold text-gray-900 dark:text-white">{{ uniqueUsers }}</p>
                                </div>
                            </div>
                        </div>
                        <div class="bg-white dark:bg-gray-800 rounded-2xl p-5 shadow-sm border border-gray-100 dark:border-gray-700 hover:shadow-md transition-shadow">
                            <div class="flex items-center gap-4">
                                <div class="p-3 bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded-xl">
                                    <span class="material-symbols-outlined">library_books</span>
                                </div>
                                <div>
                                    <p class="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Total Enrollments</p>
                                    <p class="text-2xl font-bold text-gray-900 dark:text-white">{{ progressData.length }}</p>
                                </div>
                            </div>
                        </div>
                        <div class="bg-white dark:bg-gray-800 rounded-2xl p-5 shadow-sm border border-gray-100 dark:border-gray-700 hover:shadow-md transition-shadow">
                            <div class="flex items-center gap-4">
                                <div class="p-3 bg-emerald-50 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400 rounded-xl">
                                    <span class="material-symbols-outlined">workspace_premium</span>
                                </div>
                                <div>
                                    <p class="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Completed</p>
                                    <p class="text-2xl font-bold text-emerald-600 dark:text-emerald-400">{{ completedCount }}</p>
                                </div>
                            </div>
                        </div>
                        <div class="bg-white dark:bg-gray-800 rounded-2xl p-5 shadow-sm border border-gray-100 dark:border-gray-700 hover:shadow-md transition-shadow">
                            <div class="flex items-center gap-4">
                                <div class="p-3 bg-amber-50 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400 rounded-xl">
                                    <span class="material-symbols-outlined">directions_run</span>
                                </div>
                                <div>
                                    <p class="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">In Progress</p>
                                    <p class="text-2xl font-bold text-amber-600 dark:text-amber-400">{{ inProgressCount }}</p>
                                </div>
                            </div>
                        </div>
                    </div>

                    <!-- Table -->
                    <div class="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
                        <div class="px-6 py-5 border-b border-gray-100 dark:border-gray-700 bg-gray-50/50 dark:bg-gray-800/50 flex justify-between items-center">
                            <h3 class="text-lg font-bold text-gray-900 dark:text-white flex items-center gap-2">
                                <span class="material-symbols-outlined text-indigo-500">format_list_bulleted</span>
                                Detailed Progress
                            </h3>
                        </div>
                        <div class="overflow-x-auto">
                            <table class="w-full text-left border-collapse">
                                <thead>
                                    <tr class="bg-white dark:bg-gray-800 border-b border-gray-100 dark:border-gray-700">
                                        <th class="px-6 py-4 text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider whitespace-nowrap">Employee</th>
                                        <th class="px-6 py-4 text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider whitespace-nowrap">Course</th>
                                        <th class="px-6 py-4 text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider whitespace-nowrap border-l border-gray-100 dark:border-gray-700/50 bg-gray-50/30 dark:bg-gray-800/30">Status</th>
                                        <th class="px-6 py-4 text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider whitespace-nowrap text-center">Score</th>
                                        <th class="px-6 py-4 text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider whitespace-nowrap text-right">Completed</th>
                                    </tr>
                                </thead>
                                <tbody class="divide-y divide-gray-50 dark:divide-gray-700/50">
                                    <tr *ngFor="let item of progressData"
                                        class="group hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors duration-200">
                                        <td class="px-6 py-4">
                                            <div class="flex items-center gap-3">
                                                <div class="w-8 h-8 rounded-full bg-gradient-to-br from-indigo-100 to-purple-100 dark:from-indigo-900/50 dark:to-purple-900/50 flex items-center justify-center border border-indigo-200 dark:border-indigo-800">
                                                    <span class="text-xs font-bold text-indigo-700 dark:text-indigo-300">{{ item.userFullName.charAt(0) }}</span>
                                                </div>
                                                <p class="text-sm font-semibold text-gray-900 dark:text-white">{{ item.userFullName }}</p>
                                            </div>
                                        </td>
                                        <td class="px-6 py-4">
                                            <div class="flex flex-col">
                                                <p class="text-sm font-medium text-gray-700 dark:text-gray-300 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">{{ item.courseTitle }}</p>
                                                <span class="text-[10px] text-gray-500 uppercase tracking-wider mt-0.5">{{ item.courseType || 'Course' }}</span>
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
                                            <span *ngIf="item.score === null" class="text-gray-300 dark:text-gray-600">—</span>
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
export class LmsTeamProgressComponent implements OnInit {
    progressData: LmsProgressDto[] = [];
    loading = true;
    completedCount = 0;
    inProgressCount = 0;
    uniqueUsers = 0;

    constructor(private lmsService: LmsService, private cdr: ChangeDetectorRef) { }

    ngOnInit(): void {
        this.lmsService.getTeamProgress().subscribe({
            next: (data) => {
                this.progressData = data;
                this.completedCount = data.filter(d => d.status === 'COMPLETED').length;
                this.inProgressCount = data.filter(d => d.status === 'IN_PROGRESS').length;
                this.uniqueUsers = new Set(data.map(d => d.userId)).size;
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
        this.lmsService.exportCsv(this.progressData, 'team-progress.csv');
    }
}
