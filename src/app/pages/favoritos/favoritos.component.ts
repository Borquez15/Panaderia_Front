// src/app/pages/favoritos/favoritos.component.ts
import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';

interface Favorito {
  id: number;
  nombre: string;
  imagen_url?: string;
  precio: number;
}

@Component({
  selector: 'app-favoritos',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './favoritos.component.html',
  styleUrls: ['./favoritos.component.css']
})
export class FavoritosComponent implements OnInit {
  favoritos: Favorito[] = [];

  ngOnInit(): void {
    // TODO: conectarlo a un servicio de favoritos cuando lo tengas
    this.favoritos = [
      {
        id: 1,
        nombre: 'Concha de chocolate',
        imagen_url: 'assets/img/Mexican-Pan-de-Dulce-1024x709.jpg',
        precio: 18
      },
      {
        id: 2,
        nombre: 'Bolillo recién horneado',
        imagen_url: 'assets/img/pan-blanco-amish.webp',
        precio: 5
      }
    ];
  }

  quitar(fav: Favorito): void {
    this.favoritos = this.favoritos.filter(f => f.id !== fav.id);
  }

  agregarAlCarrito(fav: Favorito): void {
    // Aquí luego llamas al CartService
    alert(`Simulación: agregando "${fav.nombre}" al carrito 🛒`);
  }
}
