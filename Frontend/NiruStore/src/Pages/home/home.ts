import { Component } from '@angular/core';
import { Navbar } from '../../Components/navbar/navbar';
import { LandingPage } from '../../Components/landing-page/landing-page';
import { Footer } from '../../Components/footer/footer';
import { Products } from "../../Pages/products/products";

@Component({
  selector: 'app-home',
  imports: [Navbar, LandingPage, Footer, Products],
  templateUrl: './home.html',
  styleUrl: './home.css',
})
export class Home {}
