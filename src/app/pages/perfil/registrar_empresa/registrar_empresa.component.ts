import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';

@Component({
  selector: 'app-registrar-empresa',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './registrar-empresa.component.html',
  styleUrls: ['./registrar_empresa.component.css']
})
export class RegistrarEmpresaComponent {
  tipoRegistro: 'empresa' | 'panaderia' = 'empresa';
  form: FormGroup;
  isSubmitting = false;
  mensaje = '';
  mensajeError = false;

  private apiUrl = environment.apiUrl;

  constructor(
    private fb: FormBuilder,
    private http: HttpClient,
    private router: Router
  ) {
    this.form = this.createForm();
    this.aplicarValidadores();
  }

  private createForm(): FormGroup {
    return this.fb.group({
      // Empresa
      nombre_comercial: [''],
      razon_social: [''],
      rfc: [''],
      tipo_empresa: [''],
      email_facturacion: [''],
      telefono: [''],
      telefono_alternativo: [''],
      calle_fiscal: [''],
      numero_exterior_fiscal: [''],
      numero_interior_fiscal: [''],
      colonia_fiscal: [''],
      ciudad_fiscal: [''],
      estado_fiscal: [''],
      codigo_postal_fiscal: [''],

      // Panadería
      nombre: [''],
      descripcion: [''],
      email: [''],
      whatsapp: [''],
      calle: [''],
      numero_exterior: [''],
      numero_interior: [''],
      colonia: [''],
      ciudad: [''],
      estado: [''],
      codigo_postal: [''],

      // Común
      notas: ['']
    });
  }

  cambiarTipo(tipo: 'empresa' | 'panaderia'): void {
    this.tipoRegistro = tipo;
    this.form.reset();
    this.aplicarValidadores();
  }

  private aplicarValidadores(): void {
    // Limpiar validadores
    Object.keys(this.form.controls).forEach(key => {
      this.form.get(key)?.clearValidators();
      this.form.get(key)?.updateValueAndValidity();
    });

    if (this.tipoRegistro === 'empresa') {
      // Validadores para empresa
      this.form.get('nombre_comercial')?.setValidators([Validators.required]);
      this.form.get('razon_social')?.setValidators([Validators.required]);
      this.form.get('rfc')?.setValidators([Validators.required, Validators.minLength(12)]);
      this.form.get('tipo_empresa')?.setValidators([Validators.required]);
      this.form.get('email_facturacion')?.setValidators([Validators.required, Validators.email]);
      this.form.get('telefono')?.setValidators([Validators.required]);
      this.form.get('calle_fiscal')?.setValidators([Validators.required]);
      this.form.get('numero_exterior_fiscal')?.setValidators([Validators.required]);
      this.form.get('colonia_fiscal')?.setValidators([Validators.required]);
      this.form.get('ciudad_fiscal')?.setValidators([Validators.required]);
      this.form.get('estado_fiscal')?.setValidators([Validators.required]);
      this.form.get('codigo_postal_fiscal')?.setValidators([Validators.required]);
    } else {
      // Validadores para panadería
      this.form.get('nombre')?.setValidators([Validators.required]);
      this.form.get('email')?.setValidators([Validators.required, Validators.email]);
      this.form.get('telefono')?.setValidators([Validators.required]);
      this.form.get('calle')?.setValidators([Validators.required]);
      this.form.get('numero_exterior')?.setValidators([Validators.required]);
      this.form.get('colonia')?.setValidators([Validators.required]);
      this.form.get('ciudad')?.setValidators([Validators.required]);
      this.form.get('estado')?.setValidators([Validators.required]);
      this.form.get('codigo_postal')?.setValidators([Validators.required]);
    }

    // Actualizar validez
    Object.keys(this.form.controls).forEach(key => {
      this.form.get(key)?.updateValueAndValidity();
    });
  }

  onSubmit(): void {
    if (this.form.invalid) return;

    this.isSubmitting = true;
    this.mensaje = '';
    this.mensajeError = false;

    const endpoint = this.tipoRegistro === 'empresa'
      ? `${this.apiUrl}/api/mis-empresas/registrar-empresa`
      : `${this.apiUrl}/api/mis-empresas/registrar-panaderia`;

    const data = this.form.value;

    this.http.post(endpoint, data).subscribe({
      next: () => {
        this.mensaje = `${this.tipoRegistro === 'empresa' ? 'Empresa' : 'Panadería'} registrada exitosamente. Redirigiendo...`;
        this.mensajeError = false;

        setTimeout(() => {
          this.router.navigate(['/perfil/mis-empresas']);
        }, 2000);
      },
      error: (error) => {
        this.mensaje = error.error?.detail || 'Error al registrar. Intenta de nuevo.';
        this.mensajeError = true;
        this.isSubmitting = false;
      }
    });
  }

  cancelar(): void {
    this.router.navigate(['/perfil']);
  }
}
