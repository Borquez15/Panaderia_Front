import { Component, OnInit, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, Router } from '@angular/router';
import { CartService, CartItem } from '../../../../services/cart.service';

@Component({
  selector: 'app-ver-carrito',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './ver-carrito.component.html',
  styleUrl: './ver-carrito.component.css'
})
export class VerCarritoComponent implements OnInit {
  cartService = inject(CartService);
  router = inject(Router);

  cart = this.cartService.cart;
  updatingItem = signal<number | null>(null);
  removingItem = signal<number | null>(null);

  subtotal = computed(() => {
    return this.cart()?.items?.reduce((sum, item) => sum + item.subtotal, 0) || 0;
  });

  envio = computed(() => {
    const subtotal = this.subtotal();
    return subtotal > 500 ? 0 : 50; // Envío gratis sobre $500
  });

  total = computed(() => {
    return this.subtotal() + this.envio();
  });

  async ngOnInit() {
    await this.cartService.loadCart();
  }

  async updateQuantity(item: CartItem, newQuantity: number) {
    if (newQuantity <= 0) {
      await this.removeItem(item);
      return;
    }

    if (newQuantity > item.producto.stock) {
      alert('No hay suficiente stock disponible');
      return;
    }

    this.updatingItem.set(item.id);
    try {
      await this.cartService.updateItemQuantity(item.id, newQuantity);
    } catch (error) {
      console.error('Error updating quantity:', error);
    } finally {
      this.updatingItem.set(null);
    }
  }

  async removeItem(item: CartItem) {
    if (!confirm('¿Estás seguro de eliminar este producto?')) return;

    this.removingItem.set(item.id);
    try {
      await this.cartService.removeItem(item.id);
    } catch (error) {
      console.error('Error removing item:', error);
    } finally {
      this.removingItem.set(null);
    }
  }

  async clearCart() {
    if (!confirm('¿Estás seguro de vaciar todo el carrito?')) return;

    try {
      await this.cartService.clearCart();
    } catch (error) {
      console.error('Error clearing cart:', error);
    }
  }

  goToCheckout() {
    this.router.navigate(['/checkout']);
  }

  continueShopping() {
    this.router.navigate(['/productos']);
  }
}