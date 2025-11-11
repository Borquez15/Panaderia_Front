import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css']
})
export class HomeComponent {
  sidebarVisible = false;

  productos = [
    { nombre: 'Pan Blanco', imagen: 'assets/img/pan-blanco-amish.webp' },
    { nombre: 'Pan Integral', imagen: 'assets/img/Pan-integral.webp' },
    { nombre: 'Pan Dulce', imagen: 'assets/img/Mexican-Pan-de-Dulce-1024x709.jpg' },
    { nombre: 'Pan de Hamburguesa', imagen: 'assets/img/hamburguesa.webp' },
    { nombre: 'Pan de Hotdog', imagen: 'assets/img/hotdog.webp' }
  ];

  constructor(private router: Router, private authService: AuthService) {}

  toggleSidebar() {
    this.sidebarVisible = !this.sidebarVisible;
  }

  navigateTo(path: string) {
    this.sidebarVisible = false;
    this.router.navigate([path]);
  }

  irATienda() {
    if (!this.authService.isAuthenticated()) {
      this.router.navigate(['/login']);
    } else {
      this.router.navigate(['/productos']);
    }
  }

  cerrarSesion() {
    this.authService.logout();
    this.sidebarVisible = false;
    this.router.navigate(['/login']);
  }
}
