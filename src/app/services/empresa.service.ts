// src/app/services/empresa.service.ts
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../environments/environment';

export interface Empresa {
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
  created_at: string;
}

export interface Panaderia {
  id: number;
  nombre: string;
  descripcion?: string;
  email: string;
  telefono: string;
  ciudad: string;
  estado: string;
  is_active: boolean;
  acepta_pedidos: boolean;
  created_at: string;
}

export interface EmpresaCreate {
  nombre_comercial: string;
  razon_social: string;
  rfc: string;
  tipo_empresa: string;
  email_facturacion: string;
  telefono: string;
  telefono_alternativo?: string;
  calle_fiscal: string;
  numero_exterior_fiscal: string;
  numero_interior_fiscal?: string;
  colonia_fiscal: string;
  ciudad_fiscal: string;
  estado_fiscal: string;
  codigo_postal_fiscal: string;
}

export interface PanaderiaCreate {
  nombre: string;
  descripcion?: string;
  email: string;
  telefono: string;
  whatsapp?: string;
  calle: string;
  numero_exterior: string;
  numero_interior?: string;
  colonia: string;
  ciudad: string;
  estado: string;
  codigo_postal: string;
}

@Injectable({
  providedIn: 'root'
})
export class EmpresaService {
  private apiUrl = `${environment.apiUrl}/api`;

  constructor(private http: HttpClient) {}

  // Obtener mis empresas
  getMisEmpresas(): Observable<Empresa[]> {
    return this.http.get<Empresa[]>(`${this.apiUrl}/mis-empresas/empresas`);
  }

  // Obtener mis panaderías
  getMisPanaderias(): Observable<Panaderia[]> {
    return this.http.get<Panaderia[]>(`${this.apiUrl}/mis-empresas/panaderias`);
  }

  // Registrar empresa
  registrarEmpresa(empresa: EmpresaCreate): Observable<Empresa> {
    return this.http.post<Empresa>(`${this.apiUrl}/mis-empresas/registrar-empresa`, empresa);
  }

  // Registrar panadería
  registrarPanaderia(panaderia: PanaderiaCreate): Observable<Panaderia> {
    return this.http.post<Panaderia>(`${this.apiUrl}/mis-empresas/registrar-panaderia`, panaderia);
  }

  // Obtener detalles de una empresa
  getEmpresa(id: number): Observable<Empresa> {
    return this.http.get<Empresa>(`${this.apiUrl}/mis-empresas/empresas/${id}`);
  }

  // Obtener detalles de una panadería
  getPanaderia(id: number): Observable<Panaderia> {
    return this.http.get<Panaderia>(`${this.apiUrl}/mis-empresas/panaderias/${id}`);
  }
}