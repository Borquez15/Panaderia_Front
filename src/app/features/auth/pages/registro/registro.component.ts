import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { HttpClient, HttpClientModule } from '@angular/common/http';

interface RegistroResponse {
  id_usuario: number;
  nombre: string;
  ap_p: string;
  ap_m?: string;
  email: string;
  activo: boolean;
}

@Component({
  selector: 'app-registro',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule, HttpClientModule],
  templateUrl: './registro.component.html',
  styleUrls: ['./registro.component.css']
})
export class RegistroComponent {
  nombre: string = '';
  ap_p: string = '';
  ap_m: string = '';
  email: string = '';
  password: string = '';
  confirmPassword: string = '';
  showPassword: boolean = false;
  showConfirmPassword: boolean = false;
  errorMessage: string = '';
  successMessage: string = '';
  isLoading: boolean = false;

  private apiUrl = 'http://localhost:8000/api/auth'; // Ajusta según tu backend

  constructor(
    private http: HttpClient,
    private router: Router
  ) {}

  togglePasswordVisibility() {
    this.showPassword = !this.showPassword;
  }

  toggleConfirmPasswordVisibility() {
    this.showConfirmPassword = !this.showConfirmPassword;
  }

  onSubmit() {
    // Limpiar mensajes
    this.errorMessage = '';
    this.successMessage = '';

    // Validaciones
    if (!this.nombre || !this.ap_p || !this.email || !this.password || !this.confirmPassword) {
      this.errorMessage = 'Por favor completa todos los campos obligatorios';
      return;
    }

    if (!this.isValidEmail(this.email)) {
      this.errorMessage = 'Por favor ingresa un email válido';
      return;
    }

    if (this.password.length < 6) {
      this.errorMessage = 'La contraseña debe tener al menos 6 caracteres';
      return;
    }

    if (this.password !== this.confirmPassword) {
      this.errorMessage = 'Las contraseñas no coinciden';
      return;
    }

    this.isLoading = true;

    const registroData = {
      nombre: this.nombre.trim(),
      ap_p: this.ap_p.trim(),
      ap_m: this.ap_m.trim() || null,
      email: this.email.toLowerCase().trim(),
      password: this.password
    };

    this.http.post<RegistroResponse>(`${this.apiUrl}/register`, registroData)
      .subscribe({
        next: (response) => {
          console.log('Registro exitoso:', response);
          this.isLoading = false;
          this.successMessage = '¡Registro exitoso! Redirigiendo al login...';
          
          // Limpiar formulario
          this.resetForm();
          
          // Redirigir al login después de 2 segundos
          setTimeout(() => {
            this.router.navigate(['/login']);
          }, 2000);
        },
        error: (error) => {
          console.error('Error en registro:', error);
          this.isLoading = false;
          
          if (error.status === 409) {
            this.errorMessage = 'Este email ya está registrado. Intenta con otro.';
          } else if (error.status === 0) {
            this.errorMessage = 'No se pudo conectar con el servidor. Verifica tu conexión.';
          } else {
            this.errorMessage = error.error?.detail || 'Error al registrarse. Intenta nuevamente.';
          }
        }
      });
  }

  private resetForm() {
    this.nombre = '';
    this.ap_p = '';
    this.ap_m = '';
    this.email = '';
    this.password = '';
    this.confirmPassword = '';
    this.showPassword = false;
    this.showConfirmPassword = false;
  }

  private isValidEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }
}