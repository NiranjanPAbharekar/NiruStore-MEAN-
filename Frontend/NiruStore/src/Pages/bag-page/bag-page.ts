import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Navbar } from "../../Components/navbar/navbar";
import { Footer } from "../../Components/footer/footer";
interface Bag {
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
  selector: 'app-bag-page',
  imports: [Navbar, Footer,CommonModule,
    FormsModule],
  templateUrl: './bag-page.html',
  styleUrl: './bag-page.css',
})
export class BagPage {
  selectedCategory = 'All';

  searchText = '';

  sortOption = 'default';


  bags: Bag[] = [

    {
      id: 1,
      name: 'Royal Leather Handbag',
      category: 'Luxury',
      price: 8999,
      oldPrice: 11999,
      discount: 25,
      rating: 5,
      reviews: 186,
      image: 'assets/bag/bag1.png',
      wishlist: false
    },

    {
      id: 2,
      name: 'Classic Black Tote',
      category: 'Women',
      price: 5999,
      oldPrice: 7499,
      discount: 20,
      rating: 4,
      reviews: 124,
      image: 'assets/bag/bag2.png',
      wishlist: false
    },

    {
      id: 3,
      name: 'Golden Chain Bag',
      category: 'Luxury',
      price: 7499,
      oldPrice: 9999,
      discount: 25,
      rating: 5,
      reviews: 231,
      image: 'assets/bag/bag3.png',
      wishlist: false
    },

    {
      id: 4,
      name: 'Elegant Brown Shoulder Bag',
      category: 'Women',
      price: 4499,
      oldPrice: 5999,
      discount: 25,
      rating: 4,
      reviews: 92,
      image: 'assets/bag/bag4.png',
      wishlist: false
    },

    {
      id: 5,
      name: 'Premium Travel Bag',
      category: 'Travel',
      price: 6999,
      oldPrice: 8499,
      discount: 18,
      rating: 5,
      reviews: 145,
      image: 'assets/bag/bag5.png',
      wishlist: false
    },

    {
      id: 6,
      name: 'Urban Messenger Bag',
      category: 'Men',
      price: 3999,
      oldPrice: 4999,
      discount: 20,
      rating: 4,
      reviews: 78,
      image: 'assets/bag/bag6.png',
      wishlist: false
    },

    {
      id: 7,
      name: 'Luxury Mini Bag',
      category: 'Luxury',
      price: 5499,
      oldPrice: 6999,
      discount: 21,
      rating: 5,
      reviews: 164,
      image: 'assets/bag/bag7.png',
      wishlist: false
    },

    {
      id: 8,
      name: 'Casual Everyday Bag',
      category: 'Casual',
      price: 2999,
      oldPrice: 3999,
      discount: 25,
      rating: 4,
      reviews: 63,
      image: 'assets/bag/bag8.png',
      wishlist: false
    }

  ];


  get filteredBags(): Bag[] {

    let result = [...this.bags];


    // Category

    if (this.selectedCategory !== 'All') {

      result = result.filter(
        bag =>
          bag.category === this.selectedCategory
      );

    }


    // Search

    if (this.searchText.trim()) {

      const search =
        this.searchText.toLowerCase().trim();

      result = result.filter(
        bag =>
          bag.name.toLowerCase().includes(search) ||
          bag.category.toLowerCase().includes(search)
      );

    }


    // Sort

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


  toggleWishlist(bag: Bag): void {

    bag.wishlist = !bag.wishlist;

  }


  addToCart(bag: Bag): void {

    console.log(
      'Bag added to cart:',
      bag
    );

  }
}
