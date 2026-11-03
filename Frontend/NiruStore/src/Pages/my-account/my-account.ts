  
import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { WishlistService } from '../../Service/wishlist-product';
import { CartService } from '../../Service/cart-product';

interface AccountOrder {
  id: string;
  date: string;
  total: string;
  status: string;
}

@Component({
  selector: 'app-my-account',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule
  ],
  templateUrl: './my-account.html',
  styleUrl: './my-account.css'
})
export class MyAccount implements OnInit {

  activeTab = 'profile';

  // Profile information
  user = {
    name: '',
    email: '',
    phone: '',
    address: ''
  };

  // Actual orders loaded from available local data
  orders: AccountOrder[] = [];

  password = {
    current: '',
    newPassword: '',
    confirm: ''
  };

  private storedUserData: any = null;

  constructor(
    private router: Router,
     private http: HttpClient,
     private wishlistService: WishlistService,
  private cartService: CartService
  ) {}

  // =========================
  // INITIALIZE ACCOUNT
  // =========================
  ngOnInit(): void {
    this.loadUserProfile();
    this.loadOrders();
  }

  // =========================
  // LOAD LOGGED-IN USER
  // =========================
  loadUserProfile(): void {
    try {
      const storedUser = localStorage.getItem('user');

      if (!storedUser) {
        alert('Please log in to view your account.');
        this.router.navigate(['/login']);
        return;
      }

      const parsed = JSON.parse(storedUser);

      // Support common API response structures
      const account =
        parsed?.user ??
        parsed?.data?.user ??
        parsed?.data ??
        parsed;

      this.storedUserData = parsed;

      // Read profile information dynamically
      this.user.name =
        account?.name ??
        account?.fullName ??
        account?.username ??
        '';

      this.user.email =
        account?.email ??
        '';

      this.user.phone =
        account?.phone ??
        account?.mobile ??
        account?.phoneNumber ??
        '';

      // Support a string address or checkout-style address object
      const address = account?.address ??
        account?.shippingAddress ??
        account?.defaultAddress ??
        '';

      this.user.address =
        typeof address === 'string'
          ? address
          : address && typeof address === 'object'
            ? [
                address.fullName,
                address.address,
                address.street,
                address.city,
                address.state,
                address.pincode,
                address.postalCode,
                address.country
              ]
                .filter(Boolean)
                .join(', ')
            : '';

    } catch (error) {
      console.error('Unable to load user profile:', error);
      alert('Unable to read your account information.');
    }
  }

  // =========================
  // SAVE PROFILE
  // =========================
  saveProfile(): void {
    try {
      const storedUser = localStorage.getItem('user');

      if (!storedUser) {
        alert('Please log in again.');
        this.router.navigate(['/login']);
        return;
      }

      const parsed = JSON.parse(storedUser);

      // Update the same user object used by the login response
      const account =
        parsed?.user ??
        parsed?.data?.user ??
        parsed?.data ??
        parsed;

      account.name = this.user.name;
      account.email = this.user.email;
      account.phone = this.user.phone;

      localStorage.setItem(
        'user',
        JSON.stringify(parsed)
      );

      this.storedUserData = parsed;

      alert('Profile updated successfully!');

    } catch (error) {
      console.error('Unable to save profile:', error);
      alert('Unable to save profile information.');
    }
  }

  // =========================
  // SAVE ADDRESS
  // =========================
  saveAddress(): void {
    try {
      const storedUser = localStorage.getItem('user');

      if (!storedUser) {
        alert('Please log in again.');
        this.router.navigate(['/login']);
        return;
      }

      const parsed = JSON.parse(storedUser);

      const account =
        parsed?.user ??
        parsed?.data?.user ??
        parsed?.data ??
        parsed;

      account.address = this.user.address;

      localStorage.setItem(
        'user',
        JSON.stringify(parsed)
      );

      this.storedUserData = parsed;

      alert('Address saved successfully!');

    } catch (error) {
      console.error('Unable to save address:', error);
      alert('Unable to save address.');
    }
  }

  // =========================
  // LOAD AVAILABLE ORDERS
  // =========================
  loadOrders(): void {
    try {
      const storedUser = localStorage.getItem('user');

      const parsed = storedUser
        ? JSON.parse(storedUser)
        : null;

      const account =
        parsed?.user ??
        parsed?.data?.user ??
        parsed?.data ??
        parsed;

      // Use orders only if they are actually stored locally.
      // Replace this with your backend orders API for real history.
      const savedOrders =
        account?.orders ??
        JSON.parse(localStorage.getItem('orders') || '[]');

      if (!Array.isArray(savedOrders)) {
        this.orders = [];
        return;
      }

      this.orders = savedOrders.map(
        (order: any): AccountOrder => ({
          id: String(
            order.orderId ??
            order.id ??
            order._id ??
            'N/A'
          ),

          date: this.formatOrderDate(
            order.createdAt ??
            order.date ??
            order.orderDate
          ),

          total: this.formatOrderTotal(
            order.totalAmount ??
            order.total ??
            order.grandTotal ??
            order.totalPrice
          ),

          status: String(
            order.orderStatus ??
            order.status ??
            'Processing'
          )
        })
      );

    } catch (error) {
      console.error('Unable to load orders:', error);
      this.orders = [];
    }
  }

  // =========================
  // FORMAT ORDER DATE
  // =========================
  private formatOrderDate(value: any): string {
    if (!value) {
      return 'Date unavailable';
    }

    const date = new Date(value);

    if (isNaN(date.getTime())) {
      return String(value);
    }

    return date.toLocaleDateString('en-IN', {
      day: '2-digit',
      month: 'long',
      year: 'numeric'
    });
  }

  // =========================
  // FORMAT ORDER TOTAL
  // =========================
  private formatOrderTotal(value: any): string {
    if (value === null || value === undefined || value === '') {
      return '₹0';
    }

    const amount = Number(value);

    if (!Number.isFinite(amount)) {
      return String(value);
    }

    return amount.toLocaleString('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 2
    });
  }

  // =========================
  // CHANGE PASSWORD
  // =========================
changePassword(): void {
  if (
    !this.password.current ||
    !this.password.newPassword ||
    !this.password.confirm
  ) {
    alert('Please fill all fields.');
    return;
  }

  if (this.password.newPassword !== this.password.confirm) {
    alert('Passwords do not match.');
    return;
  }

  if (this.password.newPassword.length < 8) {
    alert('New password must be at least 8 characters.');
    return;
  }

  const storedUser = localStorage.getItem('user');

  if (!storedUser) {
    alert('Please log in again.');
    this.router.navigate(['/login']);
    return;
  }

  let user: any;

  try {
    user = JSON.parse(storedUser);
  } catch {
    alert('Invalid login session. Please log in again.');
    return;
  }

  // Adjust this if your login response stores the token elsewhere.
  const token =
    user?.token ??
    user?.accessToken ??
    user?.data?.token ??
    localStorage.getItem('token');

  if (!token) {
    alert('Authentication token not found. Please log in again.');
    return;
  }

  const payload = {
    currentPassword: this.password.current,
    newPassword: this.password.newPassword
  };

  this.http.post(
    'http://localhost:8040/api/change-password',
    payload,
    {
      headers: {
        Authorization: `Bearer ${token}`
      }
    }
  ).subscribe({
    next: (response: any) => {
      alert(response.message || 'Password changed successfully!');

      this.password = {
        current: '',
        newPassword: '',
        confirm: ''
      };
    },
    error: (error) => {
      console.error('Change password error:', error);

      alert(
        error.error?.message ||
        'Unable to change password. Please check your current password.'
      );
    }
  });
}


  // =========================
  // LOGOUT
  // =========================
 logout(): void {
  localStorage.removeItem('user');
  this.wishlistService.refreshWishlistForCurrentUser();
this.cartService.refreshCartForCurrentUser();
  localStorage.removeItem('token');

  this.router.navigate(['/login']);
}
}
