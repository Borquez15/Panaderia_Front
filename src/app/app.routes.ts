import { Routes } from '@angular/router';
import { authGuard } from './guards/auth.guard';

export const routes: Routes = [
  {
    path: '',
    loadComponent: () =>
      import('./pages/home/home.component').then((m) => m.HomeComponent),
  },
  {
    path: 'productos',
    loadComponent: () =>
      import('./features/productos/pages/lista-productos/lista-productos.component')
        .then((m) => m.ListaProductosComponent),
  },
  {
    path: 'producto/:id',
    loadComponent: () =>
      import('./features/productos/pages/producto-detalle/producto-detalle.component')
        .then((m) => m.ProductoDetalleComponent),
  },
  {
    path: 'carrito',
    loadComponent: () =>
      import('./features/carrito/pages/ver-carrito/ver-carrito.component')
        .then((m) => m.VerCarritoComponent),
  },
  {
    path: 'checkout',
    loadComponent: () =>
      import('./pages/checkout/checkout.component').then((m) => m.CheckoutComponent),
    canActivate: [authGuard],
  },
  {
    path: 'perfil',
    loadComponent: () =>
      import('./pages/perfil/perfil.component').then((m) => m.PerfilComponent),
    canActivate: [authGuard],
  },
  {
    path: 'mis-pedidos',
    loadComponent: () =>
      import('./pages/mis-pedidos/mis-pedidos.component').then((m) => m.MisPedidosComponent),
    canActivate: [authGuard],
  },
  {
    path: 'login',
    loadComponent: () =>
      import('./features/auth/pages/login/login.component').then((m) => m.LoginComponent),
  },
  {
  path: 'registro',
  loadComponent: () =>
    import('./features/auth/pages/registro/registro.component').then((m) => m.RegistroComponent),
},

  {
    path: '**',
    redirectTo: '',
  },
  
];
