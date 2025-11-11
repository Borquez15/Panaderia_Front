import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { catchError, throwError } from 'rxjs';
import { AuthService } from '../services/auth.service';

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const authService = inject(AuthService);
  const router = inject(Router);
  
  const token = authService.getToken();

  // Si hay token y no es una petición de login/register, agregar header
  if (token && !isAuthEndpoint(req.url)) {
    req = req.clone({
      setHeaders: {
        Authorization: `Bearer ${token}`
      }
    });
  }

  // Manejar errores
  return next(req).pipe(
    catchError((error) => {
      if (error.status === 401) {
        // Token inválido o expirado
        authService.logout();
        router.navigate(['/login']);
      }
      return throwError(() => error);
    })
  );
};

function isAuthEndpoint(url: string): boolean {
  return url.includes('/auth/login') || 
         url.includes('/auth/register') || 
         url.includes('/auth/logout');
}