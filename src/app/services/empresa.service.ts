import { Injectable, inject } from '@angular/core';
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
  is_verified: boolean;
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

@Injectable({
  providedIn: 'root'
})
export class EmpresasService {
  private http = inject(HttpClient);
  private apiUrl = `${environment.apiUrl}/api/mis-empresas`;

  // Empresas
  getMisEmpresas(): Observable<Empresa[]> {
    return this.http.get<Empresa[]>(`${this.apiUrl}/empresas`);
  }

  getEmpresa(id: number): Observable<Empresa> {
    return this.http.get<Empresa>(`${this.apiUrl}/empresas/${id}`);
  }

  registrarEmpresa(data: any): Observable<Empresa> {
    return this.http.post<Empresa>(`${this.apiUrl}/registrar-empresa`, data);
  }

  // Panaderías
  getMisPanaderias(): Observable<Panaderia[]> {
    return this.http.get<Panaderia[]>(`${this.apiUrl}/panaderias`);
  }

  getPanaderia(id: number): Observable<Panaderia> {
    return this.http.get<Panaderia>(`${this.apiUrl}/panaderias/${id}`);
  }

  registrarPanaderia(data: any): Observable<Panaderia> {
    return this.http.post<Panaderia>(`${this.apiUrl}/registrar-panaderia`, data);
  }
}