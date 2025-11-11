import { Injectable, signal, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { environment } from '../environments/environment';

export interface User {
  id: number;
  nombre: string;
  apellido: string;
  email: string;
  telefono?: string;
  is_admin: boolean;
  is_active: boolean;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterData {
  nombre: string;
  apellido: string;
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
    return this.token() !== null;
  }

  isAdmin(): boolean {
    return this.currentUser()?.is_admin || false;
  }

  async login(credentials: LoginCredentials): Promise<void> {
    const response = await this.http.post<AuthResponse>(
      `${environment.apiUrl}/auth/login`,
      credentials
    ).toPromise();

    if (response) {
      this.setSession(response);
    }
  }

  async register(data: RegisterData): Promise<void> {
    const response = await this.http.post<AuthResponse>(
      `${environment.apiUrl}/auth/register`,
      data
    ).toPromise();

    if (response) {
      this.setSession(response);
    }
  }

  async logout(): Promise<void> {
    this.token.set(null);
    this.currentUser.set(null);
    localStorage.removeItem('token');
    localStorage.removeItem('user');
  }

  getToken(): string | null {
    return this.token();
  }

  getCurrentUser(): User | null {
    return this.currentUser();
  }

  private setSession(authResult: AuthResponse): void {
    this.token.set(authResult.access_token);
    this.currentUser.set(authResult.user);
    localStorage.setItem('token', authResult.access_token);
    localStorage.setItem('user', JSON.stringify(authResult.user));
  }

  private loadFromStorage(): void {
    const token = localStorage.getItem('token');
    const userStr = localStorage.getItem('user');
    
    if (token && userStr) {
      this.token.set(token);
      try {
        this.currentUser.set(JSON.parse(userStr));
      } catch (e) {
        this.logout();
      }
    }
  }
}
