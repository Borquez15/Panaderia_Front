import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../environments/environment';

interface UserProfile {
  id_usuario: number;
  nombre: string;
  apellido: string;
  email: string;
  tipo_usuario: string;
  rol: string;
  telefono?: string;
}

@Component({
  selector: 'app-perfil',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './perfil.component.html',
  styleUrls: ['./perfil.component.css']
})
export class PerfilComponent implements OnInit {
  usuario: UserProfile | null = null;
  isLoading = false;
  error = '';

  constructor(private http: HttpClient) {}

  ngOnInit(): void {
    this.cargarPerfil();
  }

  get inicialNombre(): string {
    if (this.usuario?.nombre) {
      return this.usuario.nombre.charAt(0).toUpperCase();
    }
    return 'U';
  }

  private cargarPerfil(): void {
    this.isLoading = true;
    this.error = '';

    // ✅ LEER TOKEN CORRECTO
    const token = localStorage.getItem('access_token');

    console.log('🔍 Cargando perfil...');
    console.log('🔐 Token existe:', !!token);
    console.log('🔐 Token value:', token ? token.substring(0, 20) + '...' : 'null');

    if (!token) {
      this.isLoading = false;
      this.error = 'No hay sesión activa';
      console.error('❌ No hay token en localStorage');
      return;
    }

    // ✅ LLAMAR AL ENDPOINT CORRECTO
    this.http.get<UserProfile>(`${environment.apiUrl}/api/users/me`, {
      headers: {
        Authorization: `Bearer ${token}`
      }
    }).subscribe({
      next: (user) => {
        console.log('✅ Usuario cargado exitosamente:', user);
        this.usuario = user;
        this.isLoading = false;
      },
      error: (err) => {
        console.error('❌ Error al cargar perfil:', err);
        console.error('❌ Status:', err.status);
        console.error('❌ Message:', err.message);
        console.error('❌ Error completo:', err.error);
        
        this.isLoading = false;

        if (err.status === 401) {
          this.error = 'Sesión expirada. Inicia sesión nuevamente.';
          // Limpiar token inválido
          localStorage.removeItem('access_token');
          localStorage.removeItem('user');
        } else if (err.status === 403) {
          this.error = 'No tienes permisos para ver esta información.';
        } else {
          this.error = 'No se pudo cargar la información del usuario.';
        }
      }
    });
  }
}