import { Component } from '@angular/core';
import { NotificationPopoverComponent } from './components/notification-popover/notification-popover.component';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';

import { AuthService } from '../../core/services/auth.service';
import { SearchService } from '../../core/services/search';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [CommonModule, NotificationPopoverComponent, RouterModule],
  templateUrl: './header.component.html',
  styleUrl: './header.css'
})
export class HeaderComponent {
  isDarkMode = false;

  constructor(public authService: AuthService, public searchService: SearchService, private router: Router) {
    this.isDarkMode = localStorage.getItem('darkMode') === 'true' ||
      (!localStorage.getItem('darkMode') && window.matchMedia('(prefers-color-scheme: dark)').matches);
    this.applyDarkMode();
  }

  toggleDarkMode() {
    this.isDarkMode = !this.isDarkMode;
    localStorage.setItem('darkMode', this.isDarkMode.toString());
    this.applyDarkMode();
  }

  private applyDarkMode() {
    if (this.isDarkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }

  onSearchChange(event: Event) {
    const input = event.target as HTMLInputElement;
    this.searchService.searchQuery.set(input.value);
  }

  onSearchSubmit() {
    const query = this.searchService.searchQuery().trim();
    if (query) {
      this.router.navigate(['/search'], { queryParams: { q: query } });
    }
  }
}
