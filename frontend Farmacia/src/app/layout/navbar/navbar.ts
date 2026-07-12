import { Component, Output, EventEmitter } from '@angular/core';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [],
  templateUrl: './navbar.html',
  styleUrl: './navbar.css',
})
export class Navbar {
  @Output() menuToggle = new EventEmitter<void>();

  constructor(private authService: AuthService) {}

  getUserName(): string {
    const user = this.authService.getCurrentUser();
    return user ? user.name : 'Usuario';
  }

  getUserRoleName(): string {
    const user = this.authService.getCurrentUser();
    return user && user.role ? user.role.name : 'Invitado';
  }

  getUserInitials(): string {
    const name = this.getUserName();
    if (!name) return 'U';
    const parts = name.trim().split(/\s+/);
    if (parts.length >= 2) {
      return (parts[0][0] + parts[1][0]).toUpperCase();
    }
    return name.slice(0, 2).toUpperCase();
  }
}
