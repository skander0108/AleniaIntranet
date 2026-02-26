import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { NotificationService } from '../../../core/services/notification.service';
import { Notification } from '../../../core/models/notification.model';

@Component({
    selector: 'app-notification-details',
    standalone: true,
    imports: [CommonModule, RouterModule],
    templateUrl: './notification-details.component.html'
})
export class NotificationDetailsComponent implements OnInit {
    notification: Notification | null = null;
    loading = true;

    constructor(
        private route: ActivatedRoute,
        private notificationService: NotificationService
    ) { }

    ngOnInit() {
        this.route.params.subscribe(params => {
            const id = params['id'];
            if (id) {
                this.loadNotification(id);
            }
        });
    }

    loadNotification(id: string) {
        this.loading = true;
        this.notificationService.getNotification(id).subscribe({
            next: (data) => {
                this.notification = data;
                this.loading = false;
                // Mark as read if not already
                if (!data.isRead) {
                    this.notificationService.markAsRead(id).subscribe();
                }
            },
            error: () => {
                this.loading = false;
            }
        });
    }
}
