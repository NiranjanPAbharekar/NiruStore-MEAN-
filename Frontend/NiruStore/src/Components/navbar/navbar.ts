
import {
  Component,
  OnInit,
  OnDestroy,
  ChangeDetectorRef
} from '@angular/core';

import { RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';
import { Subscription } from 'rxjs';
import { Router } from '@angular/router';

import {
  WishlistService,
  WishlistProduct
} from '../../Service/wishlist-product';

import {
  CartService
} from '../../Service/cart-product';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [
    RouterLink,
    CommonModule
  ],
  templateUrl: './navbar.html',
  styleUrl: './navbar.css'
})
export class Navbar implements OnInit, OnDestroy {

  // =========================
  // MOBILE MENU
  // =========================
  isMenuOpen = false;
  isResetPasswordPage = false;

  // =========================
  // PROFILE DROPDOWN
  // =========================
  isProfileDropdownOpen = false;

  loggedInUserName = 'Guest';
  loggedInUserEmail = '';
  userInitial = 'G';

  // =========================
  // CART
  // =========================
  isCartenable = false;
  cartCount = 0;

  private cartSubscription?: Subscription;

  // =========================
  // WISHLIST
  // =========================
  wishlist: WishlistProduct[] = [];
  wishlistCount = 0;
  wishlistDrawerOpen = false;

  // =========================
  // SUBSCRIPTIONS
  // =========================
  private wishlistSubscription?: Subscription;
  private drawerSubscription?: Subscription;

  constructor(
    private wishlistService: WishlistService,
    private cartService: CartService,
    private cdr: ChangeDetectorRef,
    private router: Router
  ) {
     this.checkCurrentRoute();

  this.router.events.subscribe(() => {
    this.checkCurrentRoute();
  });
  }

checkCurrentRoute(): void {
  this.isResetPasswordPage =
    this.router.url.startsWith('/reset-password');
}

  // =========================
  // INITIALIZATION
  // =========================
  ngOnInit(): void {

    // LOAD LOGGED-IN USER
    this.loadLoggedInUser();

    // WISHLIST COUNT
    this.wishlistSubscription =
      this.wishlistService.wishlist$.subscribe(
        (wishlist: WishlistProduct[]) => {

          this.wishlist = wishlist;
          this.wishlistCount = wishlist.length;

          this.cdr.detectChanges();

          console.log(
            'NAVBAR WISHLIST COUNT:',
            this.wishlistCount
          );
        }
      );

    // WISHLIST DRAWER
    this.drawerSubscription =
      this.wishlistService.drawer$.subscribe(
        (isOpen: boolean) => {

          this.wishlistDrawerOpen = isOpen;

          this.cdr.detectChanges();
        }
      );

    // CART COUNT
    this.cartSubscription =
      this.cartService.cartCount$.subscribe(
        (count: number) => {

          this.cartCount = count;

          this.cdr.detectChanges();

          console.log(
            'NAVBAR CART COUNT:',
            this.cartCount
          );
        }
      );
  }

  // =========================
  // LOAD LOGGED-IN USER
  // =========================
  loadLoggedInUser(): void {

    try {

      const storedUser = localStorage.getItem('user');

      if (!storedUser) {

        this.loggedInUserName = 'Guest';
        this.loggedInUserEmail = '';
        this.userInitial = 'G';

        return;
      }

      const user = JSON.parse(storedUser);

      // Support common user object structures
      const name =
        user?.name ||
        user?.fullName ||
        user?.username ||
        user?.user?.name ||
        user?.user?.fullName ||
        user?.user?.username ||
        '';

      const email =
        user?.email ||
        user?.user?.email ||
        '';

      // Display name or email
      this.loggedInUserName =
        name || email || 'Guest';

      this.loggedInUserEmail = email;

      // Generate first letter of the name
      const displayName = String(
        name || email || 'G'
      ).trim();

      this.userInitial = displayName
        ? displayName.charAt(0).toUpperCase()
        : 'G';

    } catch (error) {

      console.error(
        'Error loading logged-in user:',
        error
      );

      this.loggedInUserName = 'Guest';
      this.loggedInUserEmail = '';
      this.userInitial = 'G';
    }
  }

  // =========================
  // TOGGLE PROFILE DROPDOWN
  // =========================
  toggleProfileDropdown(): void {

    this.isProfileDropdownOpen =
      !this.isProfileDropdownOpen;

    // Refresh user information when opening
    if (this.isProfileDropdownOpen) {
      this.loadLoggedInUser();
    }
  }

  // =========================
  // CLOSE PROFILE DROPDOWN
  // =========================
  closeProfileDropdown(): void {
    this.isProfileDropdownOpen = false;
  }

  // =========================
  // MOBILE MENU
  // =========================
  toggleMenu(): void {
    this.isMenuOpen = !this.isMenuOpen;
  }

  // =========================
  // OPEN WISHLIST
  // =========================
  openWishlist(): void {
    this.wishlistService.openDrawer();
  }

  // =========================
  // CLOSE WISHLIST
  // =========================
  closeWishlist(): void {
    this.wishlistService.closeDrawer();
  }

  // =========================
  // REMOVE WISHLIST PRODUCT
  // =========================
  removeFromWishlist(productId?: string): void {

    if (!productId) {
      return;
    }

    this.wishlistService.removeFromWishlist(productId);
  }

  // =========================
  // CLEAN UP SUBSCRIPTIONS
  // =========================
  ngOnDestroy(): void {

    this.wishlistSubscription?.unsubscribe();
    this.drawerSubscription?.unsubscribe();
    this.cartSubscription?.unsubscribe();
  }
}
