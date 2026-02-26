import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, Router } from '@angular/router';
import { AnnouncementService } from '../../../core/services/announcement.service';
import { EventService } from '../../../core/services/event.service';
import { AuthService } from '../../../core/services/auth.service';
import { Observable } from 'rxjs';

@Component({
  selector: 'app-manager-dashboard',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './manager-dashboard.html',
  styleUrl: './manager-dashboard.css'
})
export class ManagerDashboardComponent implements OnInit {
  activeTab: 'announcements' | 'events' = 'announcements';

  announcementService = inject(AnnouncementService);
  eventService = inject(EventService);
  authService = inject(AuthService);
  router = inject(Router);

  announcements$!: Observable<any>;
  events$!: Observable<any[]>;

  get userName(): string {
    const user = this.authService.getCurrentUser();
    return user?.fullName?.split(' ')[0] || 'Manager';
  }

  get isAdmin(): boolean {
    return this.authService.hasRole('ADMIN');
  }

  ngOnInit() {
    this.loadAnnouncements();
    this.loadEvents();
  }

  loadAnnouncements() {
    this.announcements$ = this.announcementService.getMyAnnouncements(0, 100);
  }

  loadEvents() {
    this.events$ = this.eventService.getMyEvents();
  }

  setActiveTab(tab: 'announcements' | 'events') {
    this.activeTab = tab;
  }

  deleteAnnouncement(id: string) {
    if (confirm('Are you sure you want to delete this announcement?')) {
      this.announcementService.delete(id).subscribe(() => this.loadAnnouncements());
    }
  }

  deleteEvent(id: string) {
    if (confirm('Are you sure you want to delete this event?')) {
      this.eventService.deleteEvent(id).subscribe(() => this.loadEvents());
    }
  }

  getStatusClass(status: string): string {
    switch (status) {
      case 'PUBLISHED':
        return 'inline-flex items-center rounded-full bg-green-100 px-2.5 py-0.5 text-xs font-medium text-green-800 dark:bg-green-900/30 dark:text-green-300';
      case 'DRAFT':
        return 'inline-flex items-center rounded-full bg-yellow-100 px-2.5 py-0.5 text-xs font-medium text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300';
      case 'ARCHIVED':
        return 'inline-flex items-center rounded-full bg-gray-100 px-2.5 py-0.5 text-xs font-medium text-gray-800 dark:bg-gray-700 dark:text-gray-300';
      default:
        return 'inline-flex items-center rounded-full bg-gray-100 px-2.5 py-0.5 text-xs font-medium text-gray-800 dark:bg-gray-700 dark:text-gray-300';
    }
  }

  getPriorityClass(priority: string): string {
    switch (priority) {
      case 'URGENT':
        return 'inline-flex items-center rounded-full bg-red-100 px-2.5 py-0.5 text-xs font-medium text-red-800 dark:bg-red-900/30 dark:text-red-300';
      case 'IMPORTANT':
        return 'inline-flex items-center rounded-full bg-orange-100 px-2.5 py-0.5 text-xs font-medium text-orange-800 dark:bg-orange-900/30 dark:text-orange-300';
      case 'NORMAL':
        return 'inline-flex items-center rounded-full bg-blue-100 px-2.5 py-0.5 text-xs font-medium text-blue-800 dark:bg-blue-900/30 dark:text-blue-300';
      default:
        return 'inline-flex items-center rounded-full bg-gray-100 px-2.5 py-0.5 text-xs font-medium text-gray-800 dark:bg-gray-700 dark:text-gray-300';
    }
  }
}
