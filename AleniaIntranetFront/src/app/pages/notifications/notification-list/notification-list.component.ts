import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { NotificationService } from '../../../core/services/notification.service';
import { Notification } from '../../../core/models/notification.model';

@Component({
    selector: 'app-notification-list',
    standalone: true,
    imports: [CommonModule],
    templateUrl: './notification-list.component.html'
})
export class NotificationListComponent implements OnInit {
    notifications: Notification[] = [];
    loading = true;

    constructor(
        private notificationService: NotificationService,
        private router: Router
    ) { }

    ngOnInit() {
        this.loadNotifications();
    }

    loadNotifications() {
        this.loading = true;
        this.notificationService.getNotifications(20).subscribe({
            next: (data) => {
                this.notifications = data;
                this.loading = false;
            },
            error: () => {
                this.loading = false;
            }
        });
    }

    markAllRead() {
        this.notificationService.markAllAsRead().subscribe(() => {
            this.loadNotifications();
        });
    }

    openDetails(notification: Notification) {
        if (!notification.isRead) {
            this.notificationService.markAsRead(notification.id).subscribe();
        }
        this.router.navigate(['/notifications', notification.id]);
    }
}
