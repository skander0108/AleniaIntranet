import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { SidebarComponent } from '../sidebar/sidebar';
import { HeaderComponent } from '../header/header';
import { ToastNotificationsComponent } from '../../shared/components/toast-notifications/toast-notifications.component';

@Component({
  selector: 'app-main-layout',
  standalone: true,
  imports: [
    RouterOutlet,
    SidebarComponent,
    HeaderComponent,
    ToastNotificationsComponent
  ],
  template: `
    <div class="flex h-screen overflow-hidden bg-background-light dark:bg-background-dark text-text-main dark:text-white transition-colors duration-200">
      <!-- Left Sidebar Navigation -->
      <app-sidebar class="hidden md:flex flex-col w-64 flex-shrink-0 z-20"></app-sidebar>

      <!-- Main Content Area -->
      <main class="flex-1 flex flex-col h-full overflow-hidden relative">
        <!-- Header -->
        <app-header class="sticky top-0 z-10 w-full"></app-header>

        <!-- Scrollable Content -->
        <div class="flex-1 overflow-y-auto bg-background-light dark:bg-background-dark p-6 lg:p-8">
          <router-outlet></router-outlet>
        </div>
      </main>

      <!-- Toast Notifications - Global -->
      <app-toast-notifications></app-toast-notifications>
    </div>
  `
})
export class MainLayoutComponent { }
