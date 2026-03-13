import { Component, OnInit, ChangeDetectorRef, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { EventService } from '../../core/services/event.service';
import { Event as AppEvent } from '../../core/models/event.model';
import { AuthService } from '../../core/services/auth.service';

interface CalendarDay {
  date: Date;
  isCurrentMonth: boolean;
  isToday: boolean;
  hasEvent: boolean;
}

@Component({
  selector: 'app-events-page',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './events-page.component.html',
  styles: [] // Styles are handled by Tailwind classes in HTML
})
export class EventsPageComponent implements OnInit {
  // Services
  private eventService = inject(EventService);
  private authService = inject(AuthService);
  private cdr = inject(ChangeDetectorRef);

  // Data
  events: AppEvent[] = [];
  filteredEvents: AppEvent[] = [];
  myEvents: AppEvent[] = [];

  // State
  categories = ['All Events', 'Corporate', 'Training', 'Social', 'Wellness'];
  currentCategory = 'All Events';
  isHR = false;

  // Calendar State
  currentDate = new Date();
  calendarDays: CalendarDay[] = [];

  ngOnInit(): void {
    // Check permissions
    this.isHR = this.authService.hasRole('MANAGER') || this.authService.hasRole('HR');

    this.loadEvents();
    this.loadMyEvents();
    this.generateCalendar();
  }

  // --- Data Loading ---

  loadEvents(): void {
    this.eventService.getAllEvents().subscribe(events => {
      // Sort by date ascending (upcoming first) and format images
      this.events = events.sort((a, b) => new Date(a.eventDate).getTime() - new Date(b.eventDate).getTime())
        .map(e => ({ ...e, imageUrl: this.formatImageUrl(e.imageUrl) }));

      // Initial filter
      this.filterByCategory(this.currentCategory);

      // Update calendar markers
      this.generateCalendar();

      this.cdr.detectChanges();
    });
  }

  loadMyEvents(): void {
    this.eventService.getMyRegisteredEvents().subscribe(events => {
      this.myEvents = events.sort((a, b) => new Date(a.eventDate).getTime() - new Date(b.eventDate).getTime())
        .map(e => ({ ...e, imageUrl: this.formatImageUrl(e.imageUrl) }));

      // Update isRegistered status in main list
      this.updateRegistrationStatus();

      this.cdr.detectChanges();
    });
  }

  private updateRegistrationStatus() {
    const myEventIds = new Set(this.myEvents.map(e => e.id));
    this.events.forEach(event => {
      event.isRegistered = myEventIds.has(event.id);
    });
  }

  // --- Getters & Helpers ---

  get featuredEvent(): AppEvent | null {
    // For now, just pick the first upcoming event as featured
    // In a real app, this would be a backend flag
    if (this.events.length > 0) {
      return this.events[0];
    }
    return null;
  }

  get currentMonthName(): string {
    return this.currentDate.toLocaleString('default', { month: 'long' });
  }

  get currentYear(): number {
    return this.currentDate.getFullYear();
  }

  // Simulate Category based on event ID or random hash
  getCategory(event: AppEvent): string {
    // Use a deterministic way to assign a category if it's missing
    // We'll use the char code sum of the ID
    const hash = event.id.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
    const simulatedCategories = ['Corporate', 'Training', 'Social', 'Wellness'];
    return simulatedCategories[hash % simulatedCategories.length];
  }

  getCategoryIcon(category: string): string {
    switch (category) {
      case 'All Events': return 'calendar_month';
      case 'Corporate': return 'business_center';
      case 'Training': return 'school';
      case 'Social': return 'coffee';
      case 'Wellness': return 'self_improvement'; // Changed from 'spa' to 'self_improvement' for better material symbol match
      default: return 'event';
    }
  }

  getCategoryColorClass(category: string): string {
    switch (category) {
      case 'Corporate': return 'text-indigo-600 bg-indigo-50 dark:bg-indigo-900/50 dark:text-indigo-300';
      case 'Training': return 'text-primary bg-blue-50 dark:bg-blue-900/50 dark:text-blue-300';
      case 'Social': return 'text-orange-600 bg-orange-50 dark:bg-orange-900/50 dark:text-orange-300';
      case 'Wellness': return 'text-green-600 bg-green-50 dark:bg-green-900/50 dark:text-green-300';
      default: return 'text-gray-600';
    }
  }

  private formatImageUrl(url: string | null | undefined): string | undefined {
    if (!url) return undefined;
    if (url.startsWith('http') || url.startsWith('/api/') || url.startsWith('assets/')) {
      return url;
    }
    return '/api/files/' + url;
  }

  // --- Actions ---

  filterByCategory(category: string): void {
    this.currentCategory = category;
    if (category === 'All Events') {
      this.filteredEvents = [...this.events];
    } else {
      this.filteredEvents = this.events.filter(event => this.getCategory(event) === category);
    }
  }

  onEventClick(event: AppEvent): void {
    console.log('Navigate to details', event);
    // Future: router.navigate(['/events', event.id]);
  }

  registerForEvent(event: AppEvent, mouseEvent?: Event): void {
    mouseEvent?.stopPropagation();
    this.eventService.registerForEvent(event.id).subscribe(() => {
      // Optimistic update
      event.isRegistered = true;
      this.loadMyEvents(); // Refresh schedule
    });
  }

  unregisterFromEvent(event: AppEvent, mouseEvent?: Event): void {
    mouseEvent?.stopPropagation();
    this.eventService.unregisterFromEvent(event.id).subscribe(() => {
      // Optimistic update
      event.isRegistered = false;
      this.loadMyEvents(); // Refresh schedule
    });
  }

  // --- Calendar Logic ---

  prevMonth(): void {
    this.currentDate = new Date(this.currentDate.getFullYear(), this.currentDate.getMonth() - 1, 1);
    this.generateCalendar();
  }

  nextMonth(): void {
    this.currentDate = new Date(this.currentDate.getFullYear(), this.currentDate.getMonth() + 1, 1);
    this.generateCalendar();
  }

  generateCalendar(): void {
    const year = this.currentDate.getFullYear();
    const month = this.currentDate.getMonth();

    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);

    // Start from the Sunday before the 1st
    const startDate = new Date(firstDay);
    startDate.setDate(startDate.getDate() - startDate.getDay()); // 0 is Sunday

    const days: CalendarDay[] = [];
    const today = new Date();

    // Generate 42 days (6 weeks) to cover any month view
    for (let i = 0; i < 42; i++) {
      const date = new Date(startDate);
      date.setDate(startDate.getDate() + i);

      const isCurrentMonth = date.getMonth() === month;
      const isToday = date.toDateString() === today.toDateString();

      // Simple check if any event falls on this day
      // Note: Using event.eventDate string comparison
      const hasEvent = this.events.some(e => {
        const eventDate = new Date(e.eventDate);
        return eventDate.toDateString() === date.toDateString();
      });

      days.push({ date, isCurrentMonth, isToday, hasEvent });
    }

    this.calendarDays = days;
  }
}
