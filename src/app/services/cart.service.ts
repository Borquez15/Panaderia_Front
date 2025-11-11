
import { Injectable, inject, signal, computed } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';
import { Product } from './product.service';

export interface CartItem {
  id: number;
  carrito_id: number;
  producto_id: number;
  cantidad: number;
  precio_unitario: number;
  subtotal: number;
  producto: Product;
  created_at: string;
  updated_at: string;
}

export interface Cart {
  id: number;
  usuario_id?: number;
  total: number;
  items: CartItem[];
  created_at: string;
  updated_at: string;
}

export interface AddToCartRequest {
  producto_id: number;
  cantidad: number;
}

export interface UpdateCartItemRequest {
  cantidad: number;
}

@Injectable({
  providedIn: 'root'
})
export class CartService {
  private http = inject(HttpClient);
  
  private _cart = signal<Cart | null>(null);
  cart = this._cart.asReadonly();
  
  itemCount = computed(() => {
    return this._cart()?.items?.reduce((sum, item) => sum + item.cantidad, 0) || 0;
  });

  total = computed(() => {
    return this._cart()?.total || 0;
  });

  isEmpty = computed(() => {
    return this.itemCount() === 0;
  });

  async loadCart(): Promise<void> {
    try {
      const cart = await this.http.get<Cart>(
        `${environment.apiUrl}/cart`
      ).toPromise();
      
      if (cart) {
        this._cart.set(cart);
      }
    } catch (error) {
      console.error('Error loading cart:', error);
      // Si hay error (ej: 401), crear carrito vacío
      this._cart.set(null);
    }
  }

  async addItem(producto_id: number, cantidad: number = 1): Promise<Cart | null> {
    try {
      const request: AddToCartRequest = { producto_id, cantidad };
      const cart = await this.http.post<Cart>(
        `${environment.apiUrl}/cart/items`,
        request
      ).toPromise();

      if (cart) {
        this._cart.set(cart);
        return cart;
      }
      return null;
    } catch (error) {
      console.error('Error adding item to cart:', error);
      throw error;
    }
  }

  async updateItemQuantity(item_id: number, cantidad: number): Promise<Cart | null> {
    if (cantidad <= 0) {
      return await this.removeItem(item_id);
    }

    try {
      const request: UpdateCartItemRequest = { cantidad };
      const cart = await this.http.put<Cart>(
        `${environment.apiUrl}/cart/items/${item_id}`,
        request
      ).toPromise();

      if (cart) {
        this._cart.set(cart);
        return cart;
      }
      return null;
    } catch (error) {
      console.error('Error updating cart item:', error);
      throw error;
    }
  }

  async removeItem(item_id: number): Promise<Cart | null> {
    try {
      const cart = await this.http.delete<Cart>(
        `${environment.apiUrl}/cart/items/${item_id}`
      ).toPromise();

      if (cart) {
        this._cart.set(cart);
        return cart;
      }
      return null;
    } catch (error) {
      console.error('Error removing item from cart:', error);
      throw error;
    }
  }

  async clearCart(): Promise<void> {
    try {
      await this.http.delete(
        `${environment.apiUrl}/cart/clear`
      ).toPromise();

      this._cart.set(null);
    } catch (error) {
      console.error('Error clearing cart:', error);
      throw error;
    }
  }

  getItem(producto_id: number): CartItem | undefined {
    return this._cart()?.items.find(item => item.producto_id === producto_id);
  }

  getItemQuantity(producto_id: number): number {
    return this.getItem(producto_id)?.cantidad || 0;
  }

  hasProduct(producto_id: number): boolean {
    return this.getItem(producto_id) !== undefined;
  }
}
