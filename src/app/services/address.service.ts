
import { Injectable, inject, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../environments/environment';

export interface Address {
  id: number;
  usuario_id: number;
  nombre_completo: string;
  telefono: string;
  calle: string;
  numero_exterior: string;
  numero_interior?: string;
  colonia: string;
  ciudad: string;
  estado: string;
  codigo_postal: string;
  referencias?: string;
  latitud?: number;
  longitud?: number;
  is_default: boolean;
  created_at: string;
  updated_at: string;
}

export interface CreateAddressRequest {
  nombre_completo: string;
  telefono: string;
  calle: string;
  numero_exterior: string;
  numero_interior?: string;
  colonia: string;
  ciudad: string;
  estado: string;
  codigo_postal: string;
  referencias?: string;
  latitud?: number;
  longitud?: number;
  is_default?: boolean;
}

export interface UpdateAddressRequest extends Partial<CreateAddressRequest> {}

@Injectable({
  providedIn: 'root'
})
export class AddressService {
  private http = inject(HttpClient);
  
  addresses = signal<Address[]>([]);
  defaultAddress = signal<Address | null>(null);
  loading = signal(false);

  async getAddresses(): Promise<Address[]> {
    try {
      this.loading.set(true);
      const addresses = await this.http.get<Address[]>(
        `${environment.apiUrl}/addresses`
      ).toPromise();

      if (addresses) {
        this.addresses.set(addresses);
        // Buscar dirección por defecto
        const defaultAddr = addresses.find(addr => addr.is_default);
        if (defaultAddr) {
          this.defaultAddress.set(defaultAddr);
        }
        return addresses;
      }
      return [];
    } catch (error) {
      console.error('Error loading addresses:', error);
      return [];
    } finally {
      this.loading.set(false);
    }
  }

  async getDefaultAddress(): Promise<Address | null> {
    try {
      const address = await this.http.get<Address>(
        `${environment.apiUrl}/addresses/default`
      ).toPromise();

      if (address) {
        this.defaultAddress.set(address);
        return address;
      }
      return null;
    } catch (error) {
      console.error('Error loading default address:', error);
      return null;
    }
  }

  async getAddressById(id: number): Promise<Address | null> {
    try {
      const address = await this.http.get<Address>(
        `${environment.apiUrl}/addresses/${id}`
      ).toPromise();

      return address || null;
    } catch (error) {
      console.error('Error loading address:', error);
      return null;
    }
  }

  async createAddress(data: CreateAddressRequest): Promise<Address | null> {
    try {
      const address = await this.http.post<Address>(
        `${environment.apiUrl}/addresses`,
        data
      ).toPromise();

      if (address) {
        // Agregar a la lista
        this.addresses.update(addresses => [...addresses, address]);
        
        // Si es la dirección por defecto, actualizarla
        if (address.is_default) {
          this.defaultAddress.set(address);
        }
        
        return address;
      }
      return null;
    } catch (error) {
      console.error('Error creating address:', error);
      throw error;
    }
  }

  async updateAddress(id: number, data: UpdateAddressRequest): Promise<Address | null> {
    try {
      const address = await this.http.put<Address>(
        `${environment.apiUrl}/addresses/${id}`,
        data
      ).toPromise();

      if (address) {
        // Actualizar en la lista
        this.addresses.update(addresses => 
          addresses.map(addr => addr.id === id ? address : addr)
        );
        
        // Si es la dirección por defecto, actualizarla
        if (address.is_default) {
          this.defaultAddress.set(address);
        }
        
        return address;
      }
      return null;
    } catch (error) {
      console.error('Error updating address:', error);
      throw error;
    }
  }

  async setDefaultAddress(id: number): Promise<Address | null> {
    try {
      const address = await this.http.post<Address>(
        `${environment.apiUrl}/addresses/${id}/set-default`,
        {}
      ).toPromise();

      if (address) {
        // Actualizar todas las direcciones
        this.addresses.update(addresses => 
          addresses.map(addr => ({
            ...addr,
            is_default: addr.id === id
          }))
        );
        
        this.defaultAddress.set(address);
        return address;
      }
      return null;
    } catch (error) {
      console.error('Error setting default address:', error);
      throw error;
    }
  }

  async deleteAddress(id: number): Promise<void> {
    try {
      await this.http.delete(
        `${environment.apiUrl}/addresses/${id}`
      ).toPromise();

      // Eliminar de la lista
      this.addresses.update(addresses => 
        addresses.filter(addr => addr.id !== id)
      );
      
      // Si era la dirección por defecto, limpiarla
      if (this.defaultAddress()?.id === id) {
        this.defaultAddress.set(null);
      }
    } catch (error) {
      console.error('Error deleting address:', error);
      throw error;
    }
  }

  formatAddress(address: Address): string {
    let formatted = `${address.calle} ${address.numero_exterior}`;
    if (address.numero_interior) {
      formatted += ` Int. ${address.numero_interior}`;
    }
    formatted += `, ${address.colonia}, ${address.ciudad}, ${address.estado} ${address.codigo_postal}`;
    return formatted;
  }

  formatShortAddress(address: Address): string {
    return `${address.calle} ${address.numero_exterior}, ${address.colonia}`;
  }
}