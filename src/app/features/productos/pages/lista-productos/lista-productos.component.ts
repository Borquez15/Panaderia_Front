
import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, ActivatedRoute } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { ProductService, Product, Category } from '../../../../core/services/product.service';
import { CartService } from '../../../../core/services/cart.service';

@Component({
  selector: 'app-lista-productos',
  standalone: true,
  imports: [CommonModule, RouterLink, FormsModule],
  templateUrl: './lista-productos.component.html',
  styleUrl: './lista-productos.component.css'
})
export class ListaProductosComponent implements OnInit {
  productService = inject(ProductService);
  cartService = inject(CartService);
  route = inject(ActivatedRoute);

  products = signal<Product[]>([]);
  categories = signal<Category[]>([]);
  loading = signal(false);
  addingToCart = signal<number | null>(null);
  selectedCategory = signal<number | null>(null);
  searchQuery = signal('');

  // Filtros para el sidebar
  filters = {
    priceRange: [0, 1000],
    sortBy: 'featured',
    inStock: true
  };

  async ngOnInit() {
    await this.loadCategories();
    await this.loadProducts();
  }

  async loadCategories() {
    const categories = await this.productService.getCategories();
    this.categories.set(categories);
  }

  async loadProducts() {
    this.loading.set(true);
    try {
      const products = await this.productService.getProducts({
        categoria_id: this.selectedCategory() || undefined,
        query: this.searchQuery() || undefined,
        limit: 50
      });
      this.products.set(products);
    } finally {
      this.loading.set(false);
    }
  }

  selectCategory(categoryId: number | null) {
    this.selectedCategory.set(categoryId);
    this.loadProducts();
  }

  onSearch() {
    this.loadProducts();
  }

  async addToCart(product: Product) {
    if (product.stock <= 0) return;
    
    this.addingToCart.set(product.id);
    try {
      await this.cartService.addItem(product.id, 1);
      // TODO: Mostrar toast de éxito
    } catch (error) {
      console.error('Error adding to cart:', error);
    } finally {
      this.addingToCart.set(null);
    }
  }

  getPrecioFinal(product: Product): number {
    return this.productService.getPrecioFinal(product);
  }

  tieneDescuento(product: Product): boolean {
    return this.productService.tieneDescuento(product);
  }

  calcularDescuento(product: Product): number {
    return this.productService.calcularDescuento(product);
  }
}
