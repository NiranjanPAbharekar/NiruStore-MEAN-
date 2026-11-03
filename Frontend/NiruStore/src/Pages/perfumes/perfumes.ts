import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Footer } from "../../Components/footer/footer";
import { Navbar } from "../../Components/navbar/navbar";
interface Perfume {
  id: number;
  name: string;
  category: string;
  notes: string;
  price: number;
  oldPrice?: number;
  discount?: number;
  rating: number;
  reviews: number;
  image: string;
  wishlist: boolean;
}

@Component({
  selector: 'app-perfumes',
  imports: [Footer, Navbar, CommonModule,
    FormsModule],
  templateUrl: './perfumes.html',
  styleUrl: './perfumes.css',
})
export class Perfumes {
   selectedCategory = 'All';

  searchText = '';

  sortOption = 'default';


  perfumes: Perfume[] = [

    {
      id: 1,
      name: 'Royal Oud',
      category: 'Luxury',
      notes: 'Oud • Amber • Sandalwood',
      price: 6999,
      oldPrice: 8999,
      discount: 22,
      rating: 5,
      reviews: 215,
      image: 'assets/perfume/perfume1.png',
      wishlist: false
    },

    {
      id: 2,
      name: 'Midnight Noir',
      category: 'Men',
      notes: 'Bergamot • Leather • Musk',
      price: 4999,
      oldPrice: 6499,
      discount: 23,
      rating: 4,
      reviews: 143,
      image: 'assets/perfume/perfume2.png',
      wishlist: false
    },

    {
      id: 3,
      name: 'Golden Bloom',
      category: 'Women',
      notes: 'Rose • Jasmine • Vanilla',
      price: 5499,
      oldPrice: 6999,
      discount: 21,
      rating: 5,
      reviews: 187,
      image: 'assets/perfume/perfume3.png',
      wishlist: false
    },

    {
      id: 4,
      name: 'Ocean Mist',
      category: 'Fresh',
      notes: 'Citrus • Marine • Cedar',
      price: 3499,
      oldPrice: 4499,
      discount: 22,
      rating: 4,
      reviews: 98,
      image: 'assets/perfume/perfume4.png',
      wishlist: false
    },

    {
      id: 5,
      name: 'Velvet Rose',
      category: 'Women',
      notes: 'Rose • Peony • Musk',
      price: 4599,
      oldPrice: 5999,
      discount: 23,
      rating: 5,
      reviews: 164,
      image: 'assets/perfume/perfume5.png',
      wishlist: false
    },

    {
      id: 6,
      name: 'Imperial Musk',
      category: 'Men',
      notes: 'Musk • Amber • Vanilla',
      price: 5999,
      oldPrice: 7499,
      discount: 20,
      rating: 5,
      reviews: 132,
      image: 'assets/perfume/perfume6.png',
      wishlist: false
    },

    {
      id: 7,
      name: 'Pure Essence',
      category: 'Unisex',
      notes: 'Lavender • Citrus • Musk',
      price: 3999,
      oldPrice: 4999,
      discount: 20,
      rating: 4,
      reviews: 76,
      image: 'assets/perfume/perfume7.png',
      wishlist: false
    },

    {
      id: 8,
      name: 'Royal Jasmine',
      category: 'Luxury',
      notes: 'Jasmine • Vanilla • Amber',
      price: 7499,
      oldPrice: 9499,
      discount: 21,
      rating: 5,
      reviews: 201,
      image: 'assets/perfume/perfume8.png',
      wishlist: false
    }

  ];


  get filteredPerfumes(): Perfume[] {

    let result = [...this.perfumes];


    // CATEGORY FILTER

    if (this.selectedCategory !== 'All') {

      result = result.filter(
        perfume =>
          perfume.category === this.selectedCategory
      );

    }


    // SEARCH FILTER

    if (this.searchText.trim()) {

      const search =
        this.searchText.toLowerCase().trim();

      result = result.filter(
        perfume =>
          perfume.name
            .toLowerCase()
            .includes(search) ||

          perfume.category
            .toLowerCase()
            .includes(search) ||

          perfume.notes
            .toLowerCase()
            .includes(search)
      );

    }


    // SORTING

    if (this.sortOption === 'low') {

      result.sort(
        (a, b) => a.price - b.price
      );

    }


    if (this.sortOption === 'high') {

      result.sort(
        (a, b) => b.price - a.price
      );

    }


    if (this.sortOption === 'rating') {

      result.sort(
        (a, b) => b.rating - a.rating
      );

    }


    return result;

  }


  toggleWishlist(perfume: Perfume): void {

    perfume.wishlist = !perfume.wishlist;

  }


  addToCart(perfume: Perfume): void {

    console.log(
      'Perfume added to cart:',
      perfume
    );

  }
}
