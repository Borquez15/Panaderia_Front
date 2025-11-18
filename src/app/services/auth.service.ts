
import { Injectable, signal, inject } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Router } from '@angular/router';
import { environment } from '../environments/environment';
import { firstValueFrom } from 'rxjs';

export interface User {
  id_usuario: number;
  nombre: string;
  apellido: string;
  email: string;
  telefono?: string;
  tipo_usuario: string;
  rol: string;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterData {
  nombre: string;
  ap_p: string;  // ✅ Cambiado de apellido a ap_p
  ap_m?: string;
  email: string;
  password: string;
  telefono?: string;
}

export interface AuthResponse {
  user: User;
  access_token: string;
  token_type: string;
}

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private http = inject(HttpClient);
  private router = inject(Router);

  private currentUser = signal<User | null>(null);
  private token = signal<string | null>(null);

  user = this.currentUser.asReadonly();

  constructor() {
    this.loadFromStorage();
  }

  isAuthenticated(): boolean {
    const token = this.getToken();
    console.log('🔐 isAuthenticated:', !!token);
    return !!token;
  }

  // ==========================
  // LOGIN
  // ==========================
  async login(credentials: LoginCredentials): Promise<void> {
    console.log('🔐 Intentando login con:', credentials.email);
    
    try {
      // ✅ URL CORRECTA: apiUrl ya no tiene /api
      const response = await firstValueFrom(
        this.http.post<AuthResponse>(`${environment.apiUrl}/api/auth/login`, credentials)
      );

      console.log('✅ Respuesta del login:', response);

      if (response && response.access_token) {
        // ✅ Guardar el token REAL
        localStorage.setItem('access_token', response.access_token);
        localStorage.setItem('user', JSON.stringify(response.user));
        
        this.token.set(response.access_token);
        this.currentUser.set(response.user);
        
        console.log('✅ Login exitoso, token guardado');
        console.log('✅ Token:', response.access_token.substring(0, 20) + '...');
        
        // Redirigir al perfil o home
        this.router.navigate(['/perfil']);
      } else {
        throw new Error('Respuesta inválida del servidor');
      }
    } catch (error: any) {
      console.error('❌ Error en login:', error);
      throw error;
    }
  }

  // ==========================
  // REGISTRO
  // ==========================
  async register(data: RegisterData): Promise<void> {
    console.log('📝 Registrando usuario:', data.email);
    
    try {
      // ✅ URL CORRECTA
      const response = await firstValueFrom(
        this.http.post<any>(`${environment.apiUrl}/api/auth/register`, data)
      );

      console.log('✅ Usuario registrado:', response);
      
      // Después de registrar, hacer login automático
      await this.login({
        email: data.email,
        password: data.password
      });
      
    } catch (error: any) {
      console.error('❌ Error en registro:', error);
      throw error;
    }
  }

  // ==========================
  // LOGOUT
  // ==========================
  async logout(): Promise<void> {
    console.log('👋 Cerrando sesión...');
    
    this.token.set(null);
    this.currentUser.set(null);
    localStorage.removeItem('access_token');
    localStorage.removeItem('user');
    
    this.router.navigate(['/login']);
  }

  // ==========================
  // Obtener Token
  // ==========================
  getToken(): string | null {
    // ✅ Leer SIEMPRE de localStorage (más confiable)
    const token = localStorage.getItem('access_token');
    
    if (token && !this.token()) {
      this.token.set(token);
    }
    
    return token;
  }

  // ==========================
  // Obtener Usuario Actual
  // ==========================
  getCurrentUser(): User | null {
    const user = this.currentUser();
    
    if (!user) {
      // Intentar cargar de localStorage
      const userStr = localStorage.getItem('user');
      if (userStr) {
        try {
          const userData = JSON.parse(userStr);
          this.currentUser.set(userData);
          return userData;
        } catch (e) {
          console.error('Error parsing user from localStorage:', e);
        }
      }
    }
    
    return user;
  }

  // ==========================
  // Cargar usuario REAL desde backend
  // ==========================
  async loadUserFromAPI(): Promise<User | null> {
    const token = this.getToken();

    if (!token) {
      console.log('⚠️ No hay token, no se puede cargar usuario');
      return null;
    }

    try {
      console.log('🔄 Cargando usuario desde API...');
      
      // ✅ URL CORRECTA
      const response = await firstValueFrom(
        this.http.get<User>(`${environment.apiUrl}/api/users/me`, {
          headers: {
            Authorization: `Bearer ${token}`
          }
        })
      );

      console.log('✅ Usuario cargado desde API:', response);
      
      this.currentUser.set(response);
      localStorage.setItem('user', JSON.stringify(response));
      
      return response;

    } catch (error: any) {
      console.error('❌ Error loading user:', error);
      
      if (error.status === 401) {
        console.log('⚠️ Token inválido, limpiando sesión...');
        await this.logout();
      }
      
      return null;
    }
  }

  // ==========================
  // Cargar datos desde localStorage al iniciar
  // ==========================
  private loadFromStorage(): void {
    const token = localStorage.getItem('access_token');
    const userStr = localStorage.getItem('user');

    console.log('🔄 Cargando desde localStorage...');
    console.log('  Token existe:', !!token);
    console.log('  User existe:', !!userStr);

    if (token) {
      this.token.set(token);
      
      if (userStr) {
        try {
          const user = JSON.parse(userStr);
          this.currentUser.set(user);
          console.log('✅ Sesión restaurada:', user.email);
        } catch (e) {
          console.error('❌ Error parsing user:', e);
        }
      }
    }
  }
}