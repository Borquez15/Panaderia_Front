import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { catchError, throwError } from 'rxjs';
import { AuthService } from '../services/auth.service';

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const authService = inject(AuthService);
  const router = inject(Router);

  // 🔥 Siempre leer directamente el token REAL desde localStorage
  const token = authService.getToken();

  console.log('🔐 Interceptor - URL:', req.url);
  console.log('🔐 Interceptor - Token exists:', !!token);
  console.log('🔐 Interceptor - Token value:', token ? token.substring(0, 20) + '...' : 'null');

  // Agregar token a TODAS las rutas excepto login/register/logout
  if (token && !isAuthEndpoint(req.url)) {
    req = req.clone({
      setHeaders: {
        Authorization: `Bearer ${token}`
      }
    });
    console.log('✅ Authorization header agregado');
  } else {
    console.log('❌ Token NO agregado:', !token ? 'No existe token' : 'Es endpoint auth');
  }

  return next(req).pipe(
    catchError(error => {
      console.error('❌ Error HTTP:', error.status, error.message);

      if (error.status === 401 || error.status === 403) {
        console.warn('⚠️ Token inválido o expirado. Cerrando sesión...');
        authService.logout();
        router.navigate(['/login']);
      }

      return throwError(() => error);
    })
  );
};

function isAuthEndpoint(url: string): boolean {
  return (
    url.includes('/auth/login') ||
    url.includes('/auth/register') ||
    url.includes('/auth/logout')
  );
}
