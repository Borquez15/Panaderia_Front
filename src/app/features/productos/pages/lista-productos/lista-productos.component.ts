// src/app/features/productos/pages/lista-productos/lista-productos.component.ts
import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ProductService, Product } from '../../../../services/product.service';
import { CartService } from '../../../../services/cart.service';
import { AuthService } from '../../../../services/auth.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-lista-productos',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './lista-productos.component.html',
  styleUrl: './lista-productos.component.css'
})
export class ListaProductosComponent implements OnInit {
  productService = inject(ProductService);
  cartService = inject(CartService);
  authService = inject(AuthService);
  router = inject(Router);

  // Signals
  products = signal<Product[]>([]);
  categories = signal<string[]>([]);
  loading = signal(false);
  addingToCart = signal<number | null>(null);
  selectedCategory = signal<string | null>(null);
  searchQuery = '';
  sidebarVisible = false;

  async ngOnInit() {
    console.log('🎯 Inicializando componente de productos...');
    await this.loadCategories();
    await this.loadProducts();
  }

  /**
   * Cargar categorías del backend
   */
  async loadCategories() {
    try {
      console.log('📂 Cargando categorías...');
      const categories = await this.productService.getCategories();
      console.log('✅ Categorías recibidas:', categories);
      this.categories.set(categories as any);
    } catch (error) {
      console.error('❌ Error cargando categorías:', error);
      this.categories.set([]);
    }
  }

  /**
   * Cargar productos del backend
   */
  async loadProducts() {
    this.loading.set(true);
    try {
      console.log('📦 Cargando productos...', {
        categoria: this.selectedCategory(),
        busqueda: this.searchQuery
      });

      const products = await this.productService.getProducts({
        query: this.searchQuery || undefined,
        limit: 50
      });

      console.log('📦 Productos recibidos del backend:', products);
      console.log('📦 Cantidad:', products.length);
      
      // Log del primer producto para ver estructura
      if (products.length > 0) {
        console.log('📦 Primer producto:', products[0]);
        console.log('📦 Precio del primer producto:', products[0].precio);
      }

      // Filtrar por categoría si está seleccionada
      let filteredProducts = products;
      if (this.selectedCategory()) {
        filteredProducts = products.filter(
          p => p.categoria === this.selectedCategory()
        );
        console.log('📂 Productos filtrados por categoría:', filteredProducts.length);
      }

      // Validar que todos los productos tengan precio
      const productosValidos = filteredProducts.filter(p => {
        if (p.precio == null || p.precio === undefined) {
          console.warn('⚠️ Producto sin precio:', p);
          return false;
        }
        return true;
      });

      console.log('✅ Productos válidos:', productosValidos.length);
      this.products.set(productosValidos);

    } catch (error) {
      console.error('❌ Error cargando productos:', error);
      this.products.set([]);
    } finally {
      this.loading.set(false);
    }
  }

  /**
   * Seleccionar categoría
   */
  selectCategory(category: string | null) {
    console.log('📂 Categoría seleccionada:', category);
    this.selectedCategory.set(category);
    this.loadProducts();
  }

  /**
   * Buscar productos
   */
  onSearch() {
    console.log('🔍 Buscando:', this.searchQuery);
    this.loadProducts();
  }

  /**
   * Agregar al carrito
   */
  async addToCart(product: Product) {
    if (!product.stock || product.stock <= 0) {
      alert('Producto agotado');
      return;
    }

    if (!product.precio || product.precio <= 0) {
      alert('Precio no válido');
      return;
    }

    this.addingToCart.set(product.id);
    try {
      console.log('🛒 Agregando al carrito:', product);
      await this.cartService.addItem(product.id, 1);
      console.log('✅ Producto agregado al carrito');
      alert(`${product.nombre} agregado al carrito`);
    } catch (error) {
      console.error('❌ Error agregando al carrito:', error);
      alert('Error al agregar al carrito');
    } finally {
      this.addingToCart.set(null);
    }
  }

  /**
   * Obtener precio final
   */
  getPrecioFinal(product: Product): number {
    return this.productService.getPrecioFinal(product);
  }

  /**
   * Verificar si tiene descuento
   */
  tieneDescuento(product: Product): boolean {
    return this.productService.tieneDescuento(product);
  }

  /**
   * Calcular porcentaje de descuento
   */
  calcularDescuento(product: Product): number {
    return this.productService.calcularDescuento(product);
  }

  /**
   * Toggle del sidebar
   */
  toggleSidebar() {
    this.sidebarVisible = !this.sidebarVisible;
  }

  /**
   * Navegar a una ruta
   */
  navigateTo(path: string) {
    this.sidebarVisible = false;
    this.router.navigate([path]);
  }

  /**
   * Cerrar sesión
   */
  cerrarSesion() {
    this.authService.logout();
    this.sidebarVisible = false;
    this.router.navigate(['/login']);
  }

  /**
   * Obtener imagen de categoría
   */
  getCategoryImage(categoria: string): string {
    const images: { [key: string]: string } = {
      'Pan Dulce': 'assets/img/Mexican-Pan-de-Dulce-1024x709.jpg',
      'Pan Salado': 'assets/img/pan-blanco-amish.webp',
      'Pastelería': 'assets/img/pasteleria.jpg',
      'Galletas': 'assets/img/galletas.jpg',
      'Especiales': 'assets/img/especiales.jpg'
    };

    return images[categoria] || 'assets/img/placeholder.png';
  }
}