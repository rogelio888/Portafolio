import { Component, Input, Output, EventEmitter } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [RouterLink, RouterLinkActive],
  templateUrl: './sidebar.html',
  styleUrl: './sidebar.css'
})
export class Sidebar {
  @Input() isMobileOpen = false;
  @Output() closeMenu = new EventEmitter<void>();

  constructor(private authService: AuthService) {}

  onClose() {
    this.closeMenu.emit();
  }

  /**
   * Validate if the current user has the required permission slug.
   */
  hasPermission(permission: string): boolean {
    return this.authService.hasPermission(permission);
  }

  /**
   * Trigger logout cleanup and redirect.
   */
  logout(): void {
    this.onClose();
    this.authService.logout();
  }
}
