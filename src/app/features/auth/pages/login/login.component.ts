import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { AuthService, LoginCredentials } from '../../../../services/auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent {
  private authService = inject(AuthService);
  private router = inject(Router);

  email: string = '';
  password: string = '';
  showPassword: boolean = false;
  errorMessage: string = '';
  isLoading: boolean = false;

  togglePasswordVisibility() {
    this.showPassword = !this.showPassword;
  }

  async onSubmit() {
    // Validaciones básicas
    if (!this.email || !this.password) {
      this.errorMessage = 'Por favor completa todos los campos';
      return;
    }

    if (!this.isValidEmail(this.email)) {
      this.errorMessage = 'Por favor ingresa un email válido';
      return;
    }

    this.isLoading = true;
    this.errorMessage = '';

    const credentials: LoginCredentials = {
      email: this.email.toLowerCase().trim(),
      password: this.password
    };

    try {
      await this.authService.login(credentials);
      console.log('Login exitoso');
      
      // Redirigir al home
      this.router.navigate(['/']);
    } catch (error: any) {
      console.error('Error en login:', error);
      
      if (error.status === 401) {
        this.errorMessage = 'Credenciales inválidas. Verifica tu email y contraseña.';
      } else if (error.status === 403) {
        this.errorMessage = 'Tu cuenta está inactiva. Contacta al administrador.';
      } else if (error.status === 0) {
        this.errorMessage = 'No se pudo conectar con el servidor. Verifica tu conexión.';
      } else {
        this.errorMessage = error.error?.detail || 'Error al iniciar sesión. Intenta nuevamente.';
      }
    } finally {
      this.isLoading = false;
    }
  }

  private isValidEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }
}