
import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

// =========================================================
// WISHLIST PRODUCT
// =========================================================

export interface WishlistProduct {
  _id?: string;
  productName?: string;
  brand?: string;
  category?: string;
  price?: number;
  oldPrice?: number;
  discount?: number;
  discountPrice?: number;
  stock?: number;
  images?: string[];
}

// =========================================================
// WISHLIST SERVICE
// =========================================================

@Injectable({
  providedIn: 'root'
})
export class WishlistService {

  // =======================================================
  // WISHLIST SUBJECT - LOAD FROM STORAGE
  // =======================================================

  private wishlistSubject =
    new BehaviorSubject<WishlistProduct[]>(
      this.getWishlistFromStorage()
    );

  wishlist$ = this.wishlistSubject.asObservable();

  // =======================================================
  // DRAWER SUBJECT
  // =======================================================

  private drawerSubject =
    new BehaviorSubject<boolean>(false);

  drawer$ = this.drawerSubject.asObservable();

  constructor() {}

  // =======================================================
  // GET CURRENT USER STORAGE KEY
  // =======================================================

  private getWishlistStorageKey(): string {
    try {
      const storedUser = localStorage.getItem('user');

      if (!storedUser) {
        return 'wishlist_guest';
      }

      const parsedUser = JSON.parse(storedUser);

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
        return 'wishlist_guest';
      }

      return `wishlist_${String(userId)}`;

    } catch (error) {
      console.error(
        'Error identifying wishlist user:',
        error
      );

      return 'wishlist_guest';
    }
  }

  // =======================================================
  // LOAD WISHLIST FROM STORAGE
  // =======================================================

  private getWishlistFromStorage(): WishlistProduct[] {
    try {
      const key = this.getWishlistStorageKey();
      const savedWishlist = localStorage.getItem(key);

      if (!savedWishlist) {
        return [];
      }

      const wishlist = JSON.parse(savedWishlist);

      return Array.isArray(wishlist) ? wishlist : [];

    } catch (error) {
      console.error(
        'Error loading wishlist:',
        error
      );

      return [];
    }
  }

  // =======================================================
  // SAVE WISHLIST AND EMIT UPDATED VALUE
  // =======================================================

  private saveWishlist(
    wishlist: WishlistProduct[]
  ): void {
    try {
      const key = this.getWishlistStorageKey();

      localStorage.setItem(
        key,
        JSON.stringify(wishlist)
      );

      // Notify product page, Navbar and drawer.
      this.wishlistSubject.next([...wishlist]);

    } catch (error) {
      console.error(
        'Error saving wishlist:',
        error
      );
    }
  }

  // =======================================================
  // REFRESH AFTER LOGIN / LOGOUT
  // =======================================================

  refreshWishlistForCurrentUser(): void {
    const wishlist = this.getWishlistFromStorage();

    this.wishlistSubject.next([...wishlist]);
  }

  // =======================================================
  // GET WISHLIST
  // =======================================================

  getWishlist(): WishlistProduct[] {
    return this.wishlistSubject.value;
  }

  // =======================================================
  // ADD TO WISHLIST
  // =======================================================

  addToWishlist(product: WishlistProduct): void {
    if (!product?._id) {
      console.warn(
        'Cannot add wishlist product: missing _id',
        product
      );

      return;
    }

    const productId = String(product._id);

    const currentWishlist =
      this.wishlistSubject.value;

    const alreadyExists = currentWishlist.some(
      item => String(item._id) === productId
    );

    if (alreadyExists) {
      return;
    }

    const updatedWishlist = [
      ...currentWishlist,
      {
        ...product,
        _id: productId
      }
    ];

    this.saveWishlist(updatedWishlist);
  }

  // =======================================================
  // REMOVE FROM WISHLIST
  // =======================================================

  removeFromWishlist(productId: string): void {
    if (!productId) {
      return;
    }

    const updatedWishlist =
      this.wishlistSubject.value.filter(
        product => String(product._id) !== String(productId)
      );

    this.saveWishlist(updatedWishlist);
  }

  // =======================================================
  // CHECK PRODUCT
  // =======================================================

  isInWishlist(productId: string): boolean {
    if (!productId) {
      return false;
    }

    return this.wishlistSubject.value.some(
      product => String(product._id) === String(productId)
    );
  }

  // =======================================================
  // OPEN DRAWER
  // =======================================================

  openDrawer(): void {
    this.drawerSubject.next(true);
  }

  // =======================================================
  // CLOSE DRAWER
  // =======================================================

  closeDrawer(): void {
    this.drawerSubject.next(false);
  }
}
