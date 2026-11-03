import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';

import {
  CartService,
  CartProduct
} from '../../Service/cart-product';

@Component({
  selector: 'app-cart',
  standalone: true,

  imports: [
    CommonModule,
    FormsModule,
    RouterLink
  ],

  templateUrl: './cart.html'
})
export class Cart implements OnInit {

  // =========================================================
  // CART ITEMS
  // =========================================================

  cartItems: CartProduct[] = [];


  // =========================================================
  // COUPON
  // =========================================================

  couponCode: string = '';

  couponMessage: string = '';

  couponDiscount: number = 0;


  // =========================================================
  // TOTALS
  // =========================================================

  subtotal: number = 0;

  discount: number = 0;

  tax: number = 0;

  grandTotal: number = 0;


  constructor(
    private cartService: CartService
  ) {}


  // =========================================================
  // INIT
  // =========================================================

  ngOnInit(): void {

    this.loadCart();

  }


  // =========================================================
  // LOAD CART
  // =========================================================

  loadCart(): void {

    this.cartItems = this.cartService
      .getCart();

    console.log(
      'CART ITEMS:',
      this.cartItems
    );

    this.calculateTotals();

  }


  // =========================================================
  // CALCULATE TOTALS
  // =========================================================

  calculateTotals(): void {

    this.subtotal = 0;

    this.discount = 0;

    this.cartItems.forEach(
      (item: CartProduct) => {

        const quantity =
          item.quantity ?? 1;

        const price =
          Number(item.price) || 0;

        const oldPrice =
          Number(item.oldPrice) || price;


        this.subtotal +=
          price * quantity;


        if (oldPrice > price) {

          this.discount +=
            (oldPrice - price) * quantity;

        }

      }
    );


    // =======================================================
    // COUPON DISCOUNT
    // =======================================================

    this.discount +=
      this.couponDiscount;


    // =======================================================
    // TAX
    // =======================================================

    const taxableAmount =
      Math.max(
        this.subtotal - this.discount,
        0
      );


    this.tax =
      taxableAmount * 0.18;


    // =======================================================
    // GRAND TOTAL
    // =======================================================

    this.grandTotal =
      taxableAmount + this.tax;


    console.log(
      'SUBTOTAL:',
      this.subtotal
    );

    console.log(
      'DISCOUNT:',
      this.discount
    );

    console.log(
      'TAX:',
      this.tax
    );

    console.log(
      'GRAND TOTAL:',
      this.grandTotal
    );

  }


  // =========================================================
  // INCREASE QUANTITY
  // =========================================================

  increaseQty(
    item: CartProduct
  ): void {

    const stock =
      Number(item.stock) || 0;

    const currentQuantity =
      Number(item.quantity) || 1;


    if (
      currentQuantity >= stock
    ) {

      console.log(
        'Maximum available stock reached'
      );

      return;

    }


    item.quantity =
      currentQuantity + 1;


    this.cartService.updateQuantity(
      item._id!,
      item.quantity
    );


    this.loadCart();

  }


  // =========================================================
  // DECREASE QUANTITY
  // =========================================================

  decreaseQty(
    item: CartProduct
  ): void {

    const currentQuantity =
      Number(item.quantity) || 1;


    if (
      currentQuantity <= 1
    ) {

      return;

    }


    item.quantity =
      currentQuantity - 1;


    this.cartService.updateQuantity(
      item._id!,
      item.quantity
    );


    this.loadCart();

  }


  // =========================================================
  // REMOVE ITEM
  // =========================================================

  removeItem(
    id?: string
  ): void {

    if (!id) {

      console.warn(
        'Product ID is missing'
      );

      return;

    }


    this.cartService.removeFromCart(
      id
    );


    this.loadCart();

  }


  // =========================================================
  // COUPON
  // =========================================================

  applyCoupon(): void {

    const code =
      this.couponCode
        .trim()
        .toUpperCase();


    if (!code) {

      this.couponMessage =
        'Please enter a coupon code.';

      this.couponDiscount = 0;

      this.calculateTotals();

      return;

    }


    if (
      code === 'SAVE10'
    ) {

      this.couponDiscount =
        this.subtotal * 0.10;

      this.couponMessage =
        'Coupon applied successfully! 10% discount added.';

    }

    else {

      this.couponDiscount = 0;

      this.couponMessage =
        'Invalid coupon code.';

    }


    this.calculateTotals();

  }

}