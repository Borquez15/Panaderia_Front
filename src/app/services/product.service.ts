import { Injectable, inject, signal } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { environment } from '../../../environments/environment';

export interface Product {
  id: number;
  nombre: string;
  descripcion: string;
  precio: number;
  precio_oferta?: number;
  stock: number;
  imagen_url?: string;
  categoria_id?: number;
  categoria?: Category;
  is_active: boolean;
  is_destacado: boolean;
  created_at: string;
  updated_at: string;
}

export interface Category {
  id: number;
  nombre: string;
  descripcion?: string;
  imagen_url?: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface ProductFilters {
  query?: string;
  categoria_id?: number;
  precio_min?: number;
  precio_max?: number;
  destacados?: boolean;
  activos?: boolean;
  skip?: number;
  limit?: number;
}

@Injectable({
  providedIn: 'root'
})
export class ProductService {
  private http = inject(HttpClient);
  
  products = signal<Product[]>([]);
  categories = signal<Category[]>([]);
  loading = signal(false);

  async getProducts(filters: ProductFilters = {}): Promise<Product[]> {
    this.loading.set(true);
    try {
      let params = new HttpParams();
      
      if (filters.query) params = params.set('query', filters.query);
      if (filters.categoria_id) params = params.set('categoria_id', filters.categoria_id.toString());
      if (filters.precio_min !== undefined) params = params.set('precio_min', filters.precio_min.toString());
      if (filters.precio_max !== undefined) params = params.set('precio_max', filters.precio_max.toString());
      if (filters.destacados !== undefined) params = params.set('destacados', filters.destacados.toString());
      if (filters.activos !== undefined) params = params.set('activos', filters.activos.toString());
      if (filters.skip !== undefined) params = params.set('skip', filters.skip.toString());
      if (filters.limit !== undefined) params = params.set('limit', filters.limit.toString());

      const products = await this.http.get<Product[]>(
        `${environment.apiUrl}/products`,
        { params }
      ).toPromise();

      if (products) {
        this.products.set(products);
        return products;
      }
      return [];
    } catch (error) {
      console.error('Error loading products:', error);
      return [];
    } finally {
      this.loading.set(false);
    }
  }

  async getFeaturedProducts(limit: number = 10): Promise<Product[]> {
    try {
      const products = await this.http.get<Product[]>(
        `${environment.apiUrl}/products/featured`,
        { params: { limit: limit.toString() } }
      ).toPromise();
      
      return products || [];
    } catch (error) {
      console.error('Error loading featured products:', error);
      return [];
    }
  }

  async getProductById(id: number): Promise<Product | null> {
    try {
      const product = await this.http.get<Product>(
        `${environment.apiUrl}/products/${id}`
      ).toPromise();
      
      return product || null;
    } catch (error) {
      console.error('Error loading product:', error);
      return null;
    }
  }

  async getCategories(): Promise<Category[]> {
    try {
      const categories = await this.http.get<Category[]>(
        `${environment.apiUrl}/categories`
      ).toPromise();

      if (categories) {
        this.categories.set(categories);
        return categories;
      }
      return [];
    } catch (error) {
      console.error('Error loading categories:', error);
      return [];
    }
  }

  async getCategoryById(id: number): Promise<Category | null> {
    try {
      const category = await this.http.get<Category>(
        `${environment.apiUrl}/categories/${id}`
      ).toPromise();
      
      return category || null;
    } catch (error) {
      console.error('Error loading category:', error);
      return null;
    }
  }

  getPrecioFinal(product: Product): number {
    return product.precio_oferta || product.precio;
  }

  tieneDescuento(product: Product): boolean {
    return !!product.precio_oferta && product.precio_oferta < product.precio;
  }

  calcularDescuento(product: Product): number {
    if (!this.tieneDescuento(product)) return 0;
    const descuento = ((product.precio - product.precio_oferta!) / product.precio) * 100;
    return Math.round(descuento);
  }

  getProductsCount(): number {
    return this.products().length;
  }

  clearProducts(): void {
    this.products.set([]);
  }
}
