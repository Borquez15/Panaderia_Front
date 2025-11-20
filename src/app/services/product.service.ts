// src/app/services/product.service.ts
import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';
import { environment } from '../environments/environment';

export interface Product {
  id: number;
  nombre: string;
  descripcion?: string;
  precio: number;
  precio_descuento?: number;
  categoria?: string;
  categoria_id?: number;
  stock: number;
  unidad: string;
  imagen_url?: string;
  is_active: boolean;
  created_at?: string;
  updated_at?: string;
}

export interface Category {
  id: number;
  nombre: string;
  descripcion?: string;
  imagen_url?: string;
  orden?: number;
}

export interface ProductFilters {
  categoria_id?: number;
  query?: string;
  limit?: number;
  offset?: number;
  min_precio?: number;
  max_precio?: number;
  in_stock?: boolean;
}

@Injectable({
  providedIn: 'root'
})
export class ProductService {
  private http = inject(HttpClient);
  private apiUrl = environment.apiUrl;

  /**
   * Obtener lista de productos
   */
  async getProducts(filters?: ProductFilters): Promise<Product[]> {
    try {
      console.log('📦 Obteniendo productos...', filters);
      
      // Construir query params
      let params: any = {
        limit: filters?.limit || 50,
        offset: filters?.offset || 0
      };

      if (filters?.categoria_id) {
        params.category = filters.categoria_id;
      }

      if (filters?.query) {
        params.search = filters.query;
      }

      const response = await firstValueFrom(
        this.http.get<Product[]>(`${this.apiUrl}/products`, { params })
      );

      console.log('✅ Productos obtenidos:', response.length);
      return response;

    } catch (error) {
      console.error('❌ Error obteniendo productos:', error);
      return [];
    }
  }

  /**
   * Obtener categorías
   */
  async getCategories(): Promise<string[]> {
    try {
      console.log('📂 Obteniendo categorías...');
      
      const response = await firstValueFrom(
        this.http.get<string[]>(`${this.apiUrl}/categories`)
      );

      console.log('✅ Categorías obtenidas:', response);
      
      // Convertir strings a objetos Category
      return response.map((cat, index) => ({
        id: index + 1,
        nombre: cat,
        imagen_url: this.getCategoryImage(cat)
      })) as any;

    } catch (error) {
      console.error('❌ Error obteniendo categorías:', error);
      return [];
    }
  }

  /**
   * Obtener producto por ID
   */
  async getProduct(id: number): Promise<Product | null> {
    try {
      console.log('🔍 Obteniendo producto:', id);
      
      const response = await firstValueFrom(
        this.http.get<Product>(`${this.apiUrl}/products/${id}`)
      );

      console.log('✅ Producto obtenido:', response);
      return response;

    } catch (error) {
      console.error('❌ Error obteniendo producto:', error);
      return null;
    }
  }

  /**
   * Buscar productos
   */
  async searchProducts(query: string): Promise<Product[]> {
    try {
      const response = await firstValueFrom(
        this.http.get<Product[]>(`${this.apiUrl}/products/search`, {
          params: { q: query }
        })
      );

      return response;

    } catch (error) {
      console.error('❌ Error buscando productos:', error);
      return [];
    }
  }

  /**
   * Verificar si un producto tiene descuento
   */
  tieneDescuento(product: Product): boolean {
    return !!(product.precio_descuento && product.precio_descuento < product.precio);
  }

  /**
   * Obtener precio final (con descuento si aplica)
   */
  getPrecioFinal(product: Product): number {
    if (this.tieneDescuento(product)) {
      return product.precio_descuento!;
    }
    return product.precio;
  }

  /**
   * Calcular porcentaje de descuento
   */
  calcularDescuento(product: Product): number {
    if (!this.tieneDescuento(product)) return 0;
    
    const descuento = ((product.precio - product.precio_descuento!) / product.precio) * 100;
    return Math.round(descuento);
  }

  /**
   * Obtener imagen de categoría
   */
  private getCategoryImage(categoria: string): string {
    const images: { [key: string]: string } = {
      'Pan Dulce': '/assets/images/categories/pan-dulce.jpg',
      'Pan Salado': '/assets/images/categories/pan-salado.jpg',
      'Pastelería': '/assets/images/categories/pasteleria.jpg',
      'Galletas': '/assets/images/categories/galletas.jpg',
      'Especiales': '/assets/images/categories/especiales.jpg'
    };

    return images[categoria] || '/assets/images/categories/default.jpg';
  }
}