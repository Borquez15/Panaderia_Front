import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';

interface Empresa {
  id: number;
  nombre_comercial: string;
  razon_social: string;
  rfc: string;
  tipo_empresa: string;
  email_facturacion: string;
  telefono: string;
  ciudad_fiscal: string;
  estado_fiscal: string;
  is_active: boolean;
  is_verified: boolean;
}

interface Panaderia {
  id: number;
  nombre: string;
  descripcion?: string;
  logo_url?: string;
  email: string;
  telefono: string;
  ciudad: string;
  estado: string;
  is_active: boolean;
  acepta_pedidos: boolean;
}

@Component({
  selector: 'app-mis-empresas',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './mis_empresas.component.html',
  styleUrls: ['./mis_empresas.component.css']
})
export class MisEmpresasComponent implements OnInit {
  tabActiva: 'empresas' | 'panaderias' = 'empresas';
  empresas: Empresa[] = [];
  panaderias: Panaderia[] = [];
  isLoading = false;

  private apiUrl = environment.apiUrl;

  constructor(
    private http: HttpClient,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.cargarEmpresas();
    this.cargarPanaderias();
  }

  cargarEmpresas(): void {
    this.isLoading = true;
    this.http.get<any>(`${this.apiUrl}/api/mis-empresas/empresas`).subscribe({
      next: (response) => {
        this.empresas = response.empresas || [];
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Error al cargar empresas:', error);
        this.isLoading = false;
      }
    });
  }

  cargarPanaderias(): void {
    this.http.get<any>(`${this.apiUrl}/api/mis-empresas/panaderias`).subscribe({
      next: (response) => {
        this.panaderias = response.panaderias || [];
      },
      error: (error) => {
        console.error('Error al cargar panaderías:', error);
      }
    });
  }

  verDetalles(empresaId: number): void {
    this.router.navigate(['/perfil/empresa', empresaId]);
  }

  verDetallesPanaderia(panaderiaId: number): void {
    this.router.navigate(['/perfil/panaderia', panaderiaId]);
  }

  gestionarProductos(panaderiaId: number): void {
    this.router.navigate(['/perfil/panaderia', panaderiaId, 'productos']);
  }
}
