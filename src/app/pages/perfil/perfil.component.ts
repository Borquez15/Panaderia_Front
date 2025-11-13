import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { HttpClient, HttpClientModule } from '@angular/common/http';
import { environment } from '../../environments/environment';

interface UserProfile {
  id: number;
  nombre: string;
  ap_p?: string;
  ap_m?: string;
  email: string;
  rol?: string;
}

@Component({
  selector: 'app-perfil',
  standalone: true,
  imports: [CommonModule, RouterLink, HttpClientModule],
  templateUrl: './perfil.component.html',
  styleUrls: ['./perfil.component.css']
})
export class PerfilComponent implements OnInit {
  usuario: UserProfile | null = null;
  isLoading = false;
  error = '';
  isGuest = false;           // <-- modo invitado
  apiUrl = environment.apiUrl;

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
    this.isGuest = false;

    this.http.get<UserProfile>(`${this.apiUrl}/users/me`).subscribe({
      next: (user) => {
        this.usuario = user;
        this.isLoading = false;
        this.isGuest = false;
      },
      error: (err) => {
        console.error('Error perfil', err);
        this.isLoading = false;

        if (err.status === 401) {
          // No autenticado -> mostramos vista "invitado" sin error feo
          this.usuario = null;
          this.isGuest = true;
          this.error = '';
        } else {
          // Error real
          this.error = 'No se pudo cargar la información del usuario.';
        }
      }
    });
  }
}
