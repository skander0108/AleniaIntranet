import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './sidebar.component.html',
  styleUrl: './sidebar.css'
})
export class SidebarComponent {
  constructor(public authService: AuthService) { }

  isHR(): boolean {
    return this.authService.hasRole('ROLE_HR') || this.authService.hasRole('HR');
  }

  isCollaborator(): boolean {
    return !this.isHR();
  }
}
