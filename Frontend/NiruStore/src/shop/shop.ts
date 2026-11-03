import { Component } from '@angular/core';
import { Navbar } from "../Components/navbar/navbar";
import { Products } from "../Pages/products/products";
import { Footer } from "../Components/footer/footer";

@Component({
  selector: 'app-shop',
  imports: [Navbar, Products, Footer],
  templateUrl: './shop.html',
  styleUrl: './shop.css',
})
export class Shop {}
