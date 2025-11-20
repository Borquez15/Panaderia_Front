// src/app/pages/perfil/mis_empresas/mis-empresas.component.ts
import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { EmpresaService, Empresa, Panaderia } from '../../../services/empresa.service';

@Component({
  selector: 'app-mis-empresas',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './mis_empresas.component.html',
  styleUrls: ['./mis_empresas.component.css']
})
export class MisEmpresasComponent implements OnInit {
  empresas: Empresa[] = [];
  panaderias: Panaderia[] = [];
  isLoading = false;
  error = '';
  tabActiva: 'empresas' | 'panaderias' = 'empresas';

  constructor(private empresaService: EmpresaService) {}

  ngOnInit(): void {
    this.cargarDatos();
  }

  cargarDatos(): void {
    this.isLoading = true;
    this.error = '';

    // Cargar empresas y panaderías en paralelo
    Promise.all([
      this.empresaService.getMisEmpresas().toPromise(),
      this.empresaService.getMisPanaderias().toPromise()
    ])
    .then(([empresas, panaderias]) => {
      this.empresas = empresas || [];
      this.panaderias = panaderias || [];
      this.isLoading = false;

      console.log('✅ Datos cargados:');
      console.log('  - Empresas:', this.empresas.length);
      console.log('  - Panaderías:', this.panaderias.length);
    })
    .catch((err) => {
      console.error('❌ Error al cargar datos:', err);
      this.isLoading = false;
      
      if (err.status === 401) {
        this.error = 'Sesión expirada. Por favor inicia sesión nuevamente.';
      } else if (err.status === 403) {
        this.error = 'No tienes permisos para ver esta información.';
      } else {
        this.error = 'No se pudieron cargar tus negocios. Intenta de nuevo.';
      }
    });
  }
}