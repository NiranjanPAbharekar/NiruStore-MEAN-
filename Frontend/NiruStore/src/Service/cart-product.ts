
import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { map, distinctUntilChanged } from 'rxjs/operators';

// =========================================================
// CART PRODUCT
// =========================================================

export interface CartProduct {
  _id?: string;
  productName: string;
  brand: string;
  category: string;
  description: string;
  image: string;
  price: number;
  oldPrice?: number;
  discountPrice: number;
  rating?: number;
  reviews?: number;
  badge?: string;
  color?: string;
  stock: number;
  quantity: number;
}

// =========================================================
// CART SERVICE
// =========================================================

@Injectable({
  providedIn: 'root'
})
export class CartService {

  // =======================================================
  // CART SUBJECT
  // =======================================================

  private cartSubject = new BehaviorSubject<CartProduct[]>(
    this.getCartFromStorage()
  );

  // =======================================================
  // PUBLIC OBSERVABLES
  // =======================================================

  cart$ = this.cartSubject.asObservable();

  cartCount$ = this.cart$.pipe(
    map(cart =>
      cart.reduce(
        (total, item) =>
          total + Math.max(0, Number(item.quantity) || 0),
        0
      )
    ),
    distinctUntilChanged()
  );

  constructor() {}

  // =======================================================
  // CURRENT USER STORAGE KEY
  // =======================================================

  private getCartStorageKey(): string {
    try {
      const userData = localStorage.getItem('user');

      if (!userData) {
        return 'cart_guest';
      }

      const parsedUser = JSON.parse(userData);

      const user =
        parsedUser?.user ??
        parsedUser?.data?.user ??
        parsedUser;

      const userId =
        user?._id ??
        user?.id ??
        user?.userId ??
        user?.email;

      if (
        userId === undefined ||
        userId === null ||
        String(userId).trim() === ''
      ) {
        return 'cart_guest';
      }

      return `cart_${String(userId)}`;

    } catch (error) {
      console.error(
        'Unable to identify cart user:',
        error
      );

      return 'cart_guest';
    }
  }

  // =======================================================
  // LOAD CART FROM STORAGE
  // =======================================================

  private getCartFromStorage(): CartProduct[] {
    try {
      const key = this.getCartStorageKey();
      const savedCart = localStorage.getItem(key);

      if (!savedCart) {
        return [];
      }

      const cart = JSON.parse(savedCart);

      if (!Array.isArray(cart)) {
        return [];
      }

      return cart.map((item: CartProduct) => ({
        ...item,
        quantity: Math.max(
          1,
          Math.floor(Number(item.quantity) || 1)
        )
      }));

    } catch (error) {
      console.error('Error reading cart:', error);
      return [];
    }
  }

  // =======================================================
  // SAVE CART AND EMIT UPDATED VALUE
  // =======================================================

  private saveCart(cart: CartProduct[]): void {
    try {
      const updatedCart = cart.map(item => ({
        ...item
      }));

      localStorage.setItem(
        this.getCartStorageKey(),
        JSON.stringify(updatedCart)
      );

      // Immediately update all cart subscribers.
      this.cartSubject.next(updatedCart);

    } catch (error) {
      console.error('Error saving cart:', error);
    }
  }

  // =======================================================
  // REFRESH AFTER LOGIN / LOGOUT
  // =======================================================

  refreshCartForCurrentUser(): void {
    const cart = this.getCartFromStorage();

    this.cartSubject.next([...cart]);
  }

  // =======================================================
  // GET CURRENT CART
  // =======================================================

  getCart(): CartProduct[] {
    return this.cartSubject.value;
  }

  // =======================================================
  // ADD TO CART
  // =======================================================

  addToCart(product: CartProduct): void {
    if (!product?._id) {
      console.warn(
        'Cannot add cart product: missing _id',
        product
      );

      return;
    }

    const productId = String(product._id);
    const cart = this.cartSubject.value.map(item => ({
      ...item
    }));

    const existingItem = cart.find(
      item => String(item._id) === productId
    );

    if (existingItem) {
      const currentQuantity =
        Number(existingItem.quantity) || 0;

      const stock = Number(existingItem.stock) || 0;

      if (currentQuantity >= stock) {
        console.log('Stock limit reached');
        return;
      }

      existingItem.quantity = currentQuantity + 1;

    } else {
      const stock = Number(product.stock) || 0;

      if (stock <= 0) {
        console.log('Product is out of stock');
        return;
      }

      cart.push({
        ...product,
        _id: productId,
        stock,
        quantity: 1
      });
    }

    this.saveCart(cart);

    console.log('CART UPDATED:', this.getCart());
    console.log('NEW CART COUNT:', this.getCartCount());
  }

  // =======================================================
  // REMOVE FROM CART
  // =======================================================

  removeFromCart(productId?: string): void {
    if (!productId) {
      return;
    }

    const cart = this.cartSubject.value.filter(
      item => String(item._id) !== String(productId)
    );

    this.saveCart(cart);
  }

  // =======================================================
  // INCREASE QUANTITY
  // =======================================================

  increaseQuantity(productId?: string): void {
    if (!productId) {
      return;
    }

    const cart = this.cartSubject.value.map(item => ({
      ...item
    }));

    const item = cart.find(
      product => String(product._id) === String(productId)
    );

    if (!item) {
      return;
    }

    if (item.quantity >= Number(item.stock || 0)) {
      console.log('Maximum stock reached');
      return;
    }

    item.quantity++;

    this.saveCart(cart);
  }

  // =======================================================
  // DECREASE QUANTITY
  // =======================================================

  decreaseQuantity(productId?: string): void {
    if (!productId) {
      return;
    }

    const cart = this.cartSubject.value.map(item => ({
      ...item
    }));

    const item = cart.find(
      product => String(product._id) === String(productId)
    );

    if (!item) {
      return;
    }

    if (item.quantity > 1) {
      item.quantity--;
      this.saveCart(cart);
    }
  }

  // =======================================================
  // UPDATE QUANTITY
  // =======================================================

  updateQuantity(
    productId?: string,
    quantity?: number
  ): void {
    if (!productId || quantity === undefined) {
      return;
    }

    const requestedQuantity = Math.floor(Number(quantity));

    if (
      !Number.isFinite(requestedQuantity) ||
      requestedQuantity < 1
    ) {
      return;
    }

    const cart = this.cartSubject.value.map(item => ({
      ...item
    }));

    const item = cart.find(
      product => String(product._id) === String(productId)
    );

    if (!item) {
      return;
    }

    const stock = Number(item.stock) || 0;

    if (stock <= 0) {
      return;
    }

    item.quantity = Math.min(requestedQuantity, stock);

    this.saveCart(cart);
  }

  // =======================================================
  // CLEAR CURRENT USER'S CART
  // =======================================================

  clearCart(): void {
    this.saveCart([]);
  }

  // =======================================================
  // CART COUNT
  // =======================================================

  getCartCount(): number {
    return this.cartSubject.value.reduce(
      (total, item) =>
        total + Math.max(0, Number(item.quantity) || 0),
      0
    );
  }

  // =======================================================
  // CHECK PRODUCT
  // =======================================================

  isInCart(productId?: string): boolean {
    if (!productId) {
      return false;
    }

    return this.cartSubject.value.some(
      item => String(item._id) === String(productId)
    );
  }
}
