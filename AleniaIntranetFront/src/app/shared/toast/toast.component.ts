import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ToastService } from '../../core/services/toast.service';

@Component({
    selector: 'app-toast',
    standalone: true,
    imports: [CommonModule],
    template: `
        <div class="fixed top-4 right-4 z-[100] flex flex-col gap-3 pointer-events-none">
            @for (toast of toastService.toasts(); track toast.id) {
                <div class="pointer-events-auto flex items-center gap-3 px-5 py-3.5 rounded-xl shadow-2xl border backdrop-blur-md animate-toast-in min-w-[300px] max-w-[420px]"
                    [ngClass]="{
                        'bg-green-50/95 dark:bg-green-900/90 border-green-200 dark:border-green-800 text-green-800 dark:text-green-200': toast.type === 'success',
                        'bg-blue-50/95 dark:bg-blue-900/90 border-blue-200 dark:border-blue-800 text-blue-800 dark:text-blue-200': toast.type === 'info',
                        'bg-amber-50/95 dark:bg-amber-900/90 border-amber-200 dark:border-amber-800 text-amber-800 dark:text-amber-200': toast.type === 'warning',
                        'bg-red-50/95 dark:bg-red-900/90 border-red-200 dark:border-red-800 text-red-800 dark:text-red-200': toast.type === 'error'
                    }">
                    <span class="material-symbols-outlined text-xl shrink-0">
                        {{ toast.type === 'success' ? 'check_circle' : toast.type === 'info' ? 'info' : toast.type === 'warning' ? 'warning' : 'error' }}
                    </span>
                    <span class="text-sm font-semibold flex-1">{{ toast.message }}</span>
                    <button (click)="toastService.dismiss(toast.id)"
                        class="shrink-0 p-1 rounded-full hover:bg-black/10 dark:hover:bg-white/10 transition-colors">
                        <span class="material-symbols-outlined text-[18px]">close</span>
                    </button>
                </div>
            }
        </div>
    `,
    styles: [`
        @keyframes toastIn {
            from {
                transform: translateX(100%) scale(0.95);
                opacity: 0;
            }
            to {
                transform: translateX(0) scale(1);
                opacity: 1;
            }
        }
        .animate-toast-in {
            animation: toastIn 0.35s cubic-bezier(0.16, 1, 0.3, 1) forwards;
        }
    `]
})
export class ToastComponent {
    toastService = inject(ToastService);
}
