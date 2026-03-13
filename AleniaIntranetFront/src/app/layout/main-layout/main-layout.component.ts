import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { CommonModule } from '@angular/common';
import { SidebarComponent } from '../sidebar/sidebar';
import { HeaderComponent } from '../header/header';
import { ToastNotificationsComponent } from '../../shared/components/toast-notifications/toast-notifications.component';
import { ToastComponent } from '../../shared/toast/toast.component';
import { ChatWidgetComponent } from '../../shared/chat-widget/chat-widget.component';

@Component({
  selector: 'app-main-layout',
  standalone: true,
  imports: [
    CommonModule,
    RouterOutlet,
    SidebarComponent,
    HeaderComponent,
    ToastNotificationsComponent,
    ToastComponent,
    ChatWidgetComponent
  ],
  template: `
    <div class="flex h-screen overflow-hidden bg-background-light dark:bg-background-dark text-text-main dark:text-white transition-colors duration-200">
      <!-- Mobile Sidebar Backdrop -->
      <div *ngIf="sidebarOpen"
        class="fixed inset-0 bg-black/50 z-30 md:hidden transition-opacity"
        (click)="sidebarOpen = false"></div>

      <!-- Left Sidebar Navigation -->
      <app-sidebar
        class="fixed md:relative z-40 flex flex-col w-64 flex-shrink-0 h-full transition-transform duration-300 md:translate-x-0"
        [class.-translate-x-full]="!sidebarOpen"
        [class.translate-x-0]="sidebarOpen">
      </app-sidebar>

      <!-- Main Content Area -->
      <main class="flex-1 flex flex-col h-full overflow-hidden relative">
        <!-- Header with hamburger -->
        <header class="sticky top-0 z-10 w-full">
          <div class="flex items-center">
            <button (click)="sidebarOpen = !sidebarOpen"
              class="md:hidden p-3 text-text-muted hover:text-primary hover:bg-primary/5 transition-colors">
              <span class="material-symbols-outlined text-2xl">menu</span>
            </button>
            <app-header class="flex-1"></app-header>
          </div>
        </header>

        <!-- Scrollable Content -->
        <div class="flex-1 overflow-y-auto bg-background-light dark:bg-background-dark p-4 sm:p-6 lg:p-8">
          <router-outlet></router-outlet>
        </div>
      </main>

      <app-toast-notifications></app-toast-notifications>
      <app-toast></app-toast>
      <app-chat-widget></app-chat-widget>
    </div>
  `
})
export class MainLayoutComponent {
  sidebarOpen = false;
}

