import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './sidebar.component.html',
  styleUrl: './sidebar.css'
})
export class SidebarComponent {
  constructor(public authService: AuthService) { }

  isAdmin(): boolean {
    return this.authService.hasRole('ROLE_ADMIN');
  }

  isManagerOrAdmin(): boolean {
    return this.authService.hasAnyRole(['ROLE_MANAGER', 'ROLE_ADMIN']);
  }

  isCollaborator(): boolean {
    return !this.isManagerOrAdmin();
  }
}
