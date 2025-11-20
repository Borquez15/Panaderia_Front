// src/app/pages/perfil/registrar_empresa/registrar-empresa.component.ts
import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { EmpresaService, EmpresaCreate, PanaderiaCreate } from '../../../services/empresa.service';

@Component({
  selector: 'app-registrar-empresa',
  standalone: true,
  imports: [CommonModule, RouterLink, FormsModule],
  templateUrl: './registrar-empresa.component.html',
  styleUrls: ['./registrar_empresa.component.css']
})
export class RegistrarEmpresaComponent {
  tipoSeleccionado: 'empresa' | 'panaderia' | null = null;
  isSubmitting = false;
  mensajeExito = '';
  mensajeError = '';

  // Formulario de Empresa
  formEmpresa: EmpresaCreate = {
    nombre_comercial: '',
    razon_social: '',
    rfc: '',
    tipo_empresa: '',
    email_facturacion: '',
    telefono: '',
    telefono_alternativo: '',
    calle_fiscal: '',
    numero_exterior_fiscal: '',
    numero_interior_fiscal: '',
    colonia_fiscal: '',
    ciudad_fiscal: '',
    estado_fiscal: '',
    codigo_postal_fiscal: ''
  };

  // Formulario de Panadería
  formPanaderia: PanaderiaCreate = {
    nombre: '',
    descripcion: '',
    email: '',
    telefono: '',
    whatsapp: '',
    calle: '',
    numero_exterior: '',
    numero_interior: '',
    colonia: '',
    ciudad: '',
    estado: '',
    codigo_postal: ''
  };

  constructor(
    private empresaService: EmpresaService,
    private router: Router
  ) {}

  registrarEmpresa(): void {
    if (this.isSubmitting) return;

    this.isSubmitting = true;
    this.mensajeError = '';
    this.mensajeExito = '';

    console.log('📤 Registrando empresa:', this.formEmpresa);

    this.empresaService.registrarEmpresa(this.formEmpresa).subscribe({
      next: (empresa) => {
        console.log('✅ Empresa registrada:', empresa);
        this.isSubmitting = false;
        this.mensajeExito = `¡Empresa "${empresa.nombre_comercial}" registrada exitosamente!`;
        
        // Redirigir después de 2 segundos
        setTimeout(() => {
          this.router.navigate(['/perfil/mis-empresas']);
        }, 2000);
      },
      error: (err) => {
        console.error('❌ Error al registrar empresa:', err);
        this.isSubmitting = false;

        if (err.status === 409) {
          this.mensajeError = 'Ya existe una empresa con ese RFC';
        } else if (err.status === 400) {
          this.mensajeError = 'Datos inválidos. Revisa el formulario.';
        } else if (err.status === 401) {
          this.mensajeError = 'Sesión expirada. Por favor inicia sesión nuevamente.';
        } else {
          this.mensajeError = err.error?.detail || 'Error al registrar la empresa. Intenta de nuevo.';
        }
      }
    });
  }

  registrarPanaderia(): void {
    if (this.isSubmitting) return;

    this.isSubmitting = true;
    this.mensajeError = '';
    this.mensajeExito = '';

    console.log('📤 Registrando panadería:', this.formPanaderia);

    this.empresaService.registrarPanaderia(this.formPanaderia).subscribe({
      next: (panaderia) => {
        console.log('✅ Panadería registrada:', panaderia);
        this.isSubmitting = false;
        this.mensajeExito = `¡Panadería "${panaderia.nombre}" registrada exitosamente!`;
        
        // Redirigir después de 2 segundos
        setTimeout(() => {
          this.router.navigate(['/perfil/mis-empresas']);
        }, 2000);
      },
      error: (err) => {
        console.error('❌ Error al registrar panadería:', err);
        this.isSubmitting = false;

        if (err.status === 400) {
          this.mensajeError = 'Datos inválidos. Revisa el formulario.';
        } else if (err.status === 401) {
          this.mensajeError = 'Sesión expirada. Por favor inicia sesión nuevamente.';
        } else {
          this.mensajeError = err.error?.detail || 'Error al registrar la panadería. Intenta de nuevo.';
        }
      }
    });
  }

  limpiarFormulario(): void {
    if (this.tipoSeleccionado === 'empresa') {
      this.formEmpresa = {
        nombre_comercial: '',
        razon_social: '',
        rfc: '',
        tipo_empresa: '',
        email_facturacion: '',
        telefono: '',
        telefono_alternativo: '',
        calle_fiscal: '',
        numero_exterior_fiscal: '',
        numero_interior_fiscal: '',
        colonia_fiscal: '',
        ciudad_fiscal: '',
        estado_fiscal: '',
        codigo_postal_fiscal: ''
      };
    } else {
      this.formPanaderia = {
        nombre: '',
        descripcion: '',
        email: '',
        telefono: '',
        whatsapp: '',
        calle: '',
        numero_exterior: '',
        numero_interior: '',
        colonia: '',
        ciudad: '',
        estado: '',
        codigo_postal: ''
      };
    }
  }
}