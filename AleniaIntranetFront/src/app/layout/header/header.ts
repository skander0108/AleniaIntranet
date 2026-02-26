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
  constructor(public authService: AuthService, public searchService: SearchService, private router: Router) { }

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
