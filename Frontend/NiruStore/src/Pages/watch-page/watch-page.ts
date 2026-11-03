import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Footer } from "../../Components/footer/footer";
import { Navbar } from "../../Components/navbar/navbar";

interface Watch {
  id: number;
  name: string;
  category: string;
  price: number;
  oldPrice?: number;
  discount?: number;
  rating: number;
  reviews: number;
  image: string;
  wishlist: boolean;
}

@Component({
  selector: 'app-watch-page',
  imports: [FormsModule, CommonModule, Footer, Navbar],
  templateUrl: './watch-page.html',
  styleUrl: './watch-page.css',
})
export class WatchPage {
  selectedCategory = 'All';

  searchText = '';

  sortOption = 'default';


  watches: Watch[] = [

    {
      id: 1,
      name: 'Royal Chronograph',
      category: 'Luxury',
      price: 24999,
      oldPrice: 29999,
      discount: 17,
      rating: 5,
      reviews: 124,
      image: 'assets/watch/watch1.png',
      wishlist: false
    },

    {
      id: 2,
      name: 'Classic Black Steel',
      category: 'Men',
      price: 12999,
      oldPrice: 15999,
      discount: 19,
      rating: 4,
      reviews: 87,
      image: 'assets/watch/watch2.png',
      wishlist: false
    },

    {
      id: 3,
      name: 'Golden Heritage',
      category: 'Luxury',
      price: 32999,
      oldPrice: 38999,
      discount: 15,
      rating: 5,
      reviews: 215,
      image: 'assets/watch/watch3.png',
      wishlist: false
    },

    {
      id: 4,
      name: 'Silver Classic',
      category: 'Men',
      price: 8999,
      oldPrice: 10999,
      discount: 18,
      rating: 4,
      reviews: 63,
      image: 'assets/watch/watch4.png',
      wishlist: false
    },

    {
      id: 5,
      name: 'Elegant Rose',
      category: 'Women',
      price: 15999,
      oldPrice: 18999,
      discount: 16,
      rating: 5,
      reviews: 142,
      image: 'assets/watch/watch5.png',
      wishlist: false
    },

    {
      id: 6,
      name: 'Sport X Chrono',
      category: 'Sport',
      price: 11999,
      oldPrice: 14999,
      discount: 20,
      rating: 4,
      reviews: 94,
      image: 'assets/watch/watch6.png',
      wishlist: false
    },

    {
      id: 7,
      name: 'Midnight Edition',
      category: 'Luxury',
      price: 27999,
      oldPrice: 32999,
      discount: 15,
      rating: 5,
      reviews: 176,
      image: 'assets/watch/watch7.png',
      wishlist: false
    },

    {
      id: 8,
      name: 'Minimal Silver',
      category: 'Women',
      price: 9999,
      oldPrice: 11999,
      discount: 17,
      rating: 4,
      reviews: 72,
      image: 'assets/watch/watch8.png',
      wishlist: false
    }

  ];


  get filteredWatches(): Watch[] {

    let result = [...this.watches];


    // Category filter

    if (this.selectedCategory !== 'All') {

      result = result.filter(
        watch =>
          watch.category === this.selectedCategory
      );

    }


    // Search filter

    if (this.searchText.trim()) {

      const search =
        this.searchText.toLowerCase().trim();

      result = result.filter(
        watch =>
          watch.name.toLowerCase().includes(search) ||
          watch.category.toLowerCase().includes(search)
      );

    }


    // Sorting

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


  toggleWishlist(watch: Watch): void {

    watch.wishlist = !watch.wishlist;

  }


  addToCart(watch: Watch): void {

    console.log('Added to cart:', watch);

    // Later connect this with your Cart service

  }
}
