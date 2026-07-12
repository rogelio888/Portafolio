import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../services/auth.service';
import { NotificationService } from '../services/notification.service';

export const authGuard: CanActivateFn = (route, state) => {
  const authService = inject(AuthService);
  const router = inject(Router);
  const notificationService = inject(NotificationService);

  // 1. Check if the user is logged in
  if (!authService.isAuthenticated()) {
    router.navigate(['/login']);
    return false;
  }

  // 2. Check route-specific permissions
  const requiredPermission = route.data ? route.data['permission'] : null;
  if (requiredPermission && !authService.hasPermission(requiredPermission)) {
    notificationService.warning('No tiene permisos suficientes para acceder a este módulo.');
    router.navigate(['/app/dashboard']);
    return false;
  }

  return true;
};
