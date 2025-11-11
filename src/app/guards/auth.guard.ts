import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../services/auth.service';

export const authGuard: CanActivateFn = (route, state) => {
  const authService = inject(AuthService);
  const router = inject(Router);

  // Verifica si el usuario está autenticado
  if (authService.isAuthenticated()) {
    return true;
  }

  // Si no está autenticado, redirige al login
  router.navigate(['/login'], {
    queryParams: { redirectTo: state.url },
  });

  return false;
};
