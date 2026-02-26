import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { UsersProgressComponent } from './users-progress/users-progress.component';

@Component({
    selector: 'app-lms-global-tracking',
    standalone: true,
    imports: [CommonModule, UsersProgressComponent],
    template: `
        <div class="min-h-[calc(100vh-72px)] bg-gray-50/30 dark:bg-gray-900/10 py-8 px-4 sm:px-6 lg:px-8">
            <div class="max-w-7xl mx-auto space-y-6">
                
                <!-- Premium Header -->
                <div class="relative overflow-hidden rounded-3xl bg-white dark:bg-gray-800 shadow-sm border border-gray-100 dark:border-gray-700/60 p-8 sm:p-10">
                    <!-- Decorative Background Gradients -->
                    <div class="absolute -top-24 -right-24 w-96 h-96 bg-gradient-to-br from-primary/10 to-transparent rounded-full blur-3xl opacity-60 pointer-events-none"></div>
                    <div class="absolute -bottom-24 -left-24 w-72 h-72 bg-gradient-to-tr from-indigo-500/10 to-transparent rounded-full blur-3xl opacity-60 pointer-events-none"></div>

                    <div class="relative flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
                        <div class="flex items-center gap-6">
                            <div class="w-16 h-16 rounded-2xl bg-gradient-to-br from-primary to-indigo-600 flex items-center justify-center shadow-lg shadow-primary/20 shrink-0 border border-white/10">
                                <span class="material-symbols-outlined text-white text-3xl">public</span>
                            </div>
                            <div>
                                <h1 class="text-3xl font-extrabold text-gray-900 dark:text-white tracking-tight">Global Tracking</h1>
                                <p class="text-gray-500 dark:text-gray-400 mt-1 font-medium text-sm sm:text-base max-w-lg leading-relaxed">
                                    Monitor organization-wide learning progression and performance across all training modules.
                                </p>
                            </div>
                        </div>
                    </div>
                </div>

                <!-- Content Area: Users Detailed Progress -->
                <div class="animate-fade-in-up" style="animation-duration: 0.6s; animation-fill-mode: both;">
                    <app-users-progress></app-users-progress>
                </div>
                
            </div>
        </div>
    `
})
export class LmsGlobalTrackingComponent implements OnInit {

    constructor() { }

    ngOnInit(): void {
    }
}
