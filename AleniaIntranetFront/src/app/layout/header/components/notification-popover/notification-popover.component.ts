import { Component, OnInit, OnDestroy, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { Observable, Subscription } from 'rxjs';
import { Notification } from '../../../../core/models/notification.model';
import { NotificationService } from '../../../../core/services/notification.service';

@Component({
    selector: 'app-notification-popover',
    standalone: true,
    imports: [CommonModule, RouterModule],
    templateUrl: './notification-popover.component.html'
})
export class NotificationPopoverComponent implements OnInit {
    isOpen = false;
    notifications$: Observable<Notification[]>;
    unreadCount$: Observable<number>;

    constructor(
        private notificationService: NotificationService,
        private router: Router
    ) {
        this.notifications$ = this.notificationService.notifications$;
        this.unreadCount$ = this.notificationService.unreadCount$;
    }

    ngOnInit(): void { }

    togglePlugin() {
        this.isOpen = !this.isOpen;
        if (this.isOpen) {
            this.notificationService.refresh();
        }
    }

    markAllRead() {
        this.notificationService.markAllAsRead().subscribe();
    }

    onNotificationClick(notification: Notification) {
        if (!notification.isRead) {
            this.notificationService.markAsRead(notification.id).subscribe();
        }
        this.isOpen = false;
        this.router.navigate(['/notifications', notification.id]);
    }

    @HostListener('document:keydown.escape')
    onKeydownHandler() {
        if (this.isOpen) {
            this.isOpen = false;
        }
    }
    getIcon(type: string): string {
        switch (type) {
            case 'LEAVE_REQUEST_CREATED':
            case 'LEAVE_REQUEST_APPROVED':
            case 'LEAVE_REQUEST_REJECTED':
                return 'flight_takeoff';
            case 'IT_TICKET_CREATED':
            case 'IT_TICKET_UPDATED':
                return 'confirmation_number';
            case 'JOINER_CREATED':
                return 'person_add';
            case 'EVENT_CREATED':
                return 'calendar_month';
            case 'ANNOUNCEMENT_PUBLISHED':
                return 'campaign'; // or new_releases
            default:
                return 'notifications';
        }
    }
}
