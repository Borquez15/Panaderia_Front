
import { Injectable, inject, signal } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { environment } from '../../../environments/environment';
import { Product } from './product.service';

export enum OrderStatus {
  PENDIENTE = 'pendiente',
  PROCESANDO = 'procesando',
  ENVIADO = 'enviado',
  ENTREGADO = 'entregado',
  CANCELADO = 'cancelado'
}

export interface OrderItem {
  id: number;
  pedido_id: number;
  producto_id: number;
  cantidad: number;
  precio_unitario: number;
  subtotal: number;
  producto: Product;
  created_at: string;
}

export interface Order {
  id: number;
  usuario_id: number;
  direccion_id: number;
  total: number;
  subtotal: number;
  envio: number;
  status: OrderStatus;
  notas?: string;
  items: OrderItem[];
  created_at: string;
  updated_at: string;
}

export interface CreateOrderRequest {
  direccion_id: number;
  notas?: string;
}

@Injectable({
  providedIn: 'root'
})
export class OrderService {
  private http = inject(HttpClient);
  
  orders = signal<Order[]>([]);
  currentOrder = signal<Order | null>(null);
  loading = signal(false);

  async createOrderFromCart(direccion_id: number, notas?: string): Promise<Order | null> {
    try {
      this.loading.set(true);
      const request: CreateOrderRequest = { direccion_id, notas };
      
      const order = await this.http.post<Order>(
        `${environment.apiUrl}/orders`,
        request
      ).toPromise();

      if (order) {
        this.currentOrder.set(order);
        return order;
      }
      return null;
    } catch (error) {
      console.error('Error creating order:', error);
      throw error;
    } finally {
      this.loading.set(false);
    }
  }

  async getUserOrders(): Promise<Order[]> {
    try {
      this.loading.set(true);
      const orders = await this.http.get<Order[]>(
        `${environment.apiUrl}/orders`
      ).toPromise();

      if (orders) {
        this.orders.set(orders);
        return orders;
      }
      return [];
    } catch (error) {
      console.error('Error loading orders:', error);
      return [];
    } finally {
      this.loading.set(false);
    }
  }

  async getOrderById(id: number): Promise<Order | null> {
    try {
      this.loading.set(true);
      const order = await this.http.get<Order>(
        `${environment.apiUrl}/orders/${id}`
      ).toPromise();

      if (order) {
        this.currentOrder.set(order);
        return order;
      }
      return null;
    } catch (error) {
      console.error('Error loading order:', error);
      return null;
    } finally {
      this.loading.set(false);
    }
  }

  async cancelOrder(id: number): Promise<Order | null> {
    try {
      const order = await this.http.post<Order>(
        `${environment.apiUrl}/orders/${id}/cancel`,
        {}
      ).toPromise();

      if (order) {
        this.currentOrder.set(order);
        // Actualizar en la lista
        this.orders.update(orders => 
          orders.map(o => o.id === id ? order : o)
        );
        return order;
      }
      return null;
    } catch (error) {
      console.error('Error canceling order:', error);
      throw error;
    }
  }

  getOrderStatusLabel(status: OrderStatus): string {
    const labels: Record<OrderStatus, string> = {
      [OrderStatus.PENDIENTE]: 'Pendiente',
      [OrderStatus.PROCESANDO]: 'Procesando',
      [OrderStatus.ENVIADO]: 'Enviado',
      [OrderStatus.ENTREGADO]: 'Entregado',
      [OrderStatus.CANCELADO]: 'Cancelado'
    };
    return labels[status];
  }

  getOrderStatusColor(status: OrderStatus): string {
    const colors: Record<OrderStatus, string> = {
      [OrderStatus.PENDIENTE]: 'text-yellow-600 bg-yellow-50',
      [OrderStatus.PROCESANDO]: 'text-blue-600 bg-blue-50',
      [OrderStatus.ENVIADO]: 'text-purple-600 bg-purple-50',
      [OrderStatus.ENTREGADO]: 'text-green-600 bg-green-50',
      [OrderStatus.CANCELADO]: 'text-red-600 bg-red-50'
    };
    return colors[status];
  }

  canCancelOrder(order: Order): boolean {
    return order.status === OrderStatus.PENDIENTE;
  }
}
