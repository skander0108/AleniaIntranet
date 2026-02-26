import { Component, OnDestroy, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { NotificationService } from '../../../core/services/notification.service';
import { Notification } from '../../../core/models/notification.model';
import { Subscription } from 'rxjs';

@Component({
    selector: 'app-toast-notifications',
    standalone: true,
    imports: [CommonModule],
    template: `
    <div class="fixed top-20 right-4 z-50 flex flex-col gap-2 max-w-sm">
      <div *ngFor="let toast of toasts; trackBy: trackById"
           (click)="onToastClick(toast)"
           class="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-4 border-l-4 cursor-pointer transform transition-all hover:scale-105 animate-slide-in"
           [ngClass]="getToastClass(toast.type)">
        <div class="flex items-start gap-3">
          <div class="flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center"
               [ngClass]="getIconBgClass(toast.type)">
            <span class="material-symbols-outlined text-white text-[20px]">
              {{ getIcon(toast.type) }}
            </span>
          </div>
          <div class="flex-1 min-w-0">
            <h4 class="text-sm font-bold text-gray-900 dark:text-white mb-1">
              {{ toast.title }}
            </h4>
            <p class="text-xs text-gray-600 dark:text-gray-300 line-clamp-2">
              {{ toast.message }}
            </p>
            <span class="text-xs text-gray-400 mt-1 block">Just now</span>
          </div>
          <button (click)="dismissToast(toast, $event)"
                  class="flex-shrink-0 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition-colors">
            <span class="material-symbols-outlined text-[18px]">close</span>
          </button>
        </div>
      </div>
    </div>
  `,
    styles: [`
    @keyframes slide-in {
      from {
        transform: translateX(100%);
        opacity: 0;
      }
      to {
        transform: translateX(0);
        opacity: 1;
      }
    }

    .animate-slide-in {
      animation: slide-in 0.3s ease-out;
    }
  `]
})
export class ToastNotificationsComponent implements OnInit, OnDestroy {
    toasts: Notification[] = [];
    private subscription?: Subscription;

    constructor(
        private notificationService: NotificationService,
        private router: Router
    ) { }

    ngOnInit(): void {
        this.subscription = this.notificationService.toast$.subscribe(
            (notification: Notification) => {
                this.addToast(notification);
            }
        );
    }

    ngOnDestroy(): void {
        this.subscription?.unsubscribe();
    }

    private addToast(notification: Notification): void {
        this.toasts.unshift(notification);

        setTimeout(() => {
            this.toasts = this.toasts.filter(t => t.id !== notification.id);
        }, 5000);
    }

    getToastClass(type: string): string {
        switch (type) {
            case 'JOINER_CREATED':
                return 'border-green-500';
            case 'EVENT_CREATED':
                return 'border-blue-500';
            case 'ANNOUNCEMENT_PUBLISHED':
                return 'border-purple-500';
            default:
                return 'border-gray-400';
        }
    }

    getIconBgClass(type: string): string {
        switch (type) {
            case 'JOINER_CREATED':
                return 'bg-green-500';
            case 'EVENT_CREATED':
                return 'bg-blue-500';
            case 'ANNOUNCEMENT_PUBLISHED':
                return 'bg-purple-500';
            default:
                return 'bg-gray-500';
        }
    }

    getIcon(type: string): string {
        switch (type) {
            case 'JOINER_CREATED':
                return 'person_add';
            case 'EVENT_CREATED':
                return 'event';
            case 'ANNOUNCEMENT_PUBLISHED':
                return 'campaign';
            default:
                return 'notifications';
        }
    }

    onToastClick(toast: Notification): void {
        if (toast.linkUrl) {
            this.router.navigateByUrl(toast.linkUrl);
            this.toasts = this.toasts.filter(t => t.id !== toast.id);
        }
    }

    dismissToast(toast: Notification, event: Event): void {
        event.stopPropagation();
        this.toasts = this.toasts.filter(t => t.id !== toast.id);
    }

    trackById(index: number, toast: Notification): string {
        return toast.id;
    }
}
