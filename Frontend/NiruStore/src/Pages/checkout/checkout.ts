
import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { finalize, timeout } from 'rxjs';
import { ChangeDetectorRef } from '@angular/core';

import {
  CartService,
  CartProduct
} from '../../Service/cart-product';

type PaymentMethod = 'cod' | 'card' | 'upi';

interface DeliveryAddress {
  id: string;
  fullName: string;
  mobile: string;
  email: string;
  addressLine: string;
  landmark: string;
  city: string;
  state: string;
  pincode: string;
}

interface OrderItem {
  productId?: string;
  productName: string;
  brand: string;
  image: string;
  price: number;
  quantity: number;
}

interface CheckoutOrder {
  orderId: string;
  items: OrderItem[];
  deliveryAddress: DeliveryAddress;
  paymentMethod: PaymentMethod;
  subtotal: number;
  discount: number;
  shipping: number;
  tax: number;
  total: number;
  orderDate: string;
  status: string;
}

interface SavedOrderResponse {
  message: string;
  order: {
    _id: string;
    orderId: string;
    items: OrderItem[];
    deliveryAddress: DeliveryAddress;
    paymentMethod: PaymentMethod;
    subtotal: number;
    discount: number;
    shipping: number;
    tax: number;
    total: number;
    status: string;
    createdAt?: string;
    updatedAt?: string;
  };
}

@Component({
  selector: 'app-checkout',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    RouterLink
  ],
  templateUrl: './checkout.html',
  styleUrl: './checkout.css'
})
export class Checkout implements OnInit {

  // ==========================================
  // BACKEND API
  // ==========================================

  private readonly API_URL = 'http://localhost:8040/order';

  // ==========================================
  // CART
  // ==========================================

  cartItems: CartProduct[] = [];

  // ==========================================
  // PAYMENT
  // ==========================================

  paymentMethod: PaymentMethod = 'cod';

  // Prevent duplicate order submissions
  isPlacingOrder = false;

  // ==========================================
  // CURRENT ADDRESS FORM
  // ==========================================

  address = {
    fullName: '',
    mobile: '',
    email: '',
    addressLine: '',
    landmark: '',
    city: '',
    state: '',
    pincode: ''
  };

  // ==========================================
  // SAVED ADDRESSES
  // ==========================================

  savedAddresses: DeliveryAddress[] = [];

  selectedAddressId = '';

  saveAddress = true;

  // ==========================================
  // CARD DETAILS: DEMO ONLY
  // ==========================================

  card = {
    holderName: '',
    number: '',
    expiry: '',
    cvv: ''
  };

  // ==========================================
  // UPI DETAILS
  // ==========================================

  upiId = '';

  // ==========================================
  // SUCCESS MODAL
  // ==========================================

  orderPlaced = false;

  placedOrder: CheckoutOrder | null = null;

  constructor(
    private cartService: CartService,
    private router: Router,
    private http: HttpClient,
      private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.loadCart();
    this.loadSavedAddresses();
  }

  // ==========================================
  // CART
  // ==========================================

  loadCart(): void {
    this.cartItems = this.cartService.getCart();
  }

  get subtotal(): number {
    return this.cartItems.reduce(
      (total, item) =>
        total + item.price * item.quantity,
      0
    );
  }

  get discount(): number {
    return this.cartItems.reduce((total, item) => {
      const finalPrice =
        item.discountPrice > 0
          ? Math.min(item.price, item.discountPrice)
          : item.price;

      return total +
        (item.price - finalPrice) * item.quantity;
    }, 0);
  }

  get discountedSubtotal(): number {
    return Math.max(0, this.subtotal - this.discount);
  }

  get tax(): number {
    return this.discountedSubtotal * 0.18;
  }

  get shipping(): number {
    return 0;
  }

  get grandTotal(): number {
    return this.discountedSubtotal +
      this.tax +
      this.shipping;
  }

  // ==========================================
  // SAVED ADDRESSES
  // ==========================================

// ==========================================
// USER-SPECIFIC ADDRESS STORAGE
// ==========================================

private getAddressStorageKey(): string {
  const userData = localStorage.getItem('user');

  // Keep guest addresses separate from logged-in users.
  if (!userData) {
    return 'niruStoreAddresses_guest';
  }

  try {
    const parsedUser = JSON.parse(userData);

    // Support common login response structures.
    const user =
      parsedUser.user ??
      parsedUser.data?.user ??
      parsedUser;

    const userId =
      user._id ??
      user.id ??
      user.userId ??
      user.email;

    if (
      userId === undefined ||
      userId === null ||
      String(userId).trim() === ''
    ) {
      return 'niruStoreAddresses_guest';
    }

    return `niruStoreAddresses_${String(userId)}`;

  } catch (error) {
    console.error('Unable to identify user:', error);
    return 'niruStoreAddresses_guest';
  }
}


loadSavedAddresses(): void {
  try {
    const storageKey = this.getAddressStorageKey();
    const saved = localStorage.getItem(storageKey);

    this.savedAddresses = saved
      ? JSON.parse(saved) as DeliveryAddress[]
      : [];

  } catch (error) {
    console.error('Error loading saved addresses:', error);
    this.savedAddresses = [];
  }
}


persistSavedAddresses(): void {
  try {
    const storageKey = this.getAddressStorageKey();

    localStorage.setItem(
      storageKey,
      JSON.stringify(this.savedAddresses)
    );

    console.log('Addresses saved for:', storageKey);

  } catch (error) {
    console.error('Error saving addresses:', error);
  }
}


  selectSavedAddress(id: string): void {
    this.selectedAddressId = id;

    const selected = this.savedAddresses.find(
      item => item.id === id
    );

    if (!selected) {
      return;
    }

    this.address = {
      fullName: selected.fullName,
      mobile: selected.mobile,
      email: selected.email,
      addressLine: selected.addressLine,
      landmark: selected.landmark,
      city: selected.city,
      state: selected.state,
      pincode: selected.pincode
    };
  }

  useNewAddress(): void {
    this.selectedAddressId = '';

    this.address = {
      fullName: '',
      mobile: '',
      email: '',
      addressLine: '',
      landmark: '',
      city: '',
      state: '',
      pincode: ''
    };
  }


saveCurrentAddress(): void {

  // Do not save if the checkbox is unchecked.
  if (!this.saveAddress) {
    return;
  }

  const duplicate = this.savedAddresses.find(item =>
    item.fullName.trim().toLowerCase() ===
      this.address.fullName.trim().toLowerCase() &&
    item.mobile === this.address.mobile &&
    item.addressLine.trim().toLowerCase() ===
      this.address.addressLine.trim().toLowerCase() &&
    item.pincode === this.address.pincode
  );

  // Address already exists.
  if (duplicate) {
    this.selectedAddressId = duplicate.id;
    console.log('Address already saved.');
    return;
  }

  // Create a new address.
  const newAddress: DeliveryAddress = {
    id: `ADDR-${Date.now()}`,
    ...this.address
  };

  this.savedAddresses = [
    ...this.savedAddresses,
    newAddress
  ];

  this.selectedAddressId = newAddress.id;

  // Persist under the current user's key.
  this.persistSavedAddresses();

  console.log('New address saved:', newAddress);
}


  deleteSavedAddress(id: string): void {
    this.savedAddresses = this.savedAddresses.filter(
      item => item.id !== id
    );

    this.persistSavedAddresses();

    if (this.selectedAddressId === id) {
      this.selectedAddressId = '';
    }
  }

  // ==========================================
  // PAYMENT METHOD
  // ==========================================

  selectPayment(method: PaymentMethod): void {
    this.paymentMethod = method;
  }

  // ==========================================
  // CARD FORMATTING
  // ==========================================

  formatCardNumber(): void {
    const digits = this.card.number
      .replace(/\D/g, '')
      .slice(0, 16);

    this.card.number = digits
      .replace(/(.{4})/g, '$1 ')
      .trim();
  }

  formatExpiry(): void {
    const digits = this.card.expiry
      .replace(/\D/g, '')
      .slice(0, 4);

    this.card.expiry = digits.length > 2
      ? digits.slice(0, 2) + '/' + digits.slice(2)
      : digits;
  }

  private isExpiryValid(): boolean {
    if (!/^(0[1-9]|1[0-2])\/\d{2}$/.test(this.card.expiry)) {
      return false;
    }

    const [monthText, yearText] = this.card.expiry.split('/');

    const month = Number(monthText);
    const year = 2000 + Number(yearText);

    const now = new Date();
    const currentYear = now.getFullYear();
    const currentMonth = now.getMonth() + 1;

    return year > currentYear ||
      (year === currentYear && month >= currentMonth);
  }

  private validatePayment(): boolean {
    if (this.paymentMethod === 'cod') {
      return true;
    }

    if (this.paymentMethod === 'card') {
      const digits = this.card.number.replace(/\D/g, '');

      if (!this.card.holderName.trim()) {
        alert('Please enter the cardholder name.');
        return false;
      }

      if (!/^\d{16}$/.test(digits)) {
        alert('Please enter a valid 16-digit card number.');
        return false;
      }

      if (!this.isExpiryValid()) {
        alert('Please enter a valid, unexpired expiry date.');
        return false;
      }

      if (!/^\d{3,4}$/.test(this.card.cvv)) {
        alert('Please enter a valid CVV.');
        return false;
      }

      return true;
    }

    if (this.paymentMethod === 'upi') {
      const validUpi =
        /^[\w.-]{2,256}@[a-zA-Z0-9.-]{2,64}$/
          .test(this.upiId.trim());

      if (!validUpi) {
        alert('Please enter a valid UPI ID, e.g. name@bank.');
        return false;
      }

      return true;
    }

    return false;
  }

  // ==========================================
  // CREATE ORDER ID
  // ==========================================

  private generateOrderId(): string {
    return 'NRU-' +
      Date.now().toString().slice(-8) +
      '-' +
      Math.random().toString(36).slice(2, 6).toUpperCase();
  }

  // ==========================================
  // PLACE ORDER - SAVE TO MONGODB
  // ==========================================


testCheckoutSubmit(formValid: boolean): void {
  console.log('CHECKOUT FORM SUBMITTED');
  console.log('Form valid:', formValid);
  console.log('Cart items:', this.cartItems.length);
  console.log('Loading state:', this.isPlacingOrder);

  alert('Checkout form submitted. Check the browser console.');
}

placeOrder(formValid: boolean): void {
  console.log('1. placeOrder() called');
  console.log('2. Form valid:', formValid);
  console.log('3. Cart items:', this.cartItems.length);

  if (!formValid || this.cartItems.length === 0) {
    console.warn('Form invalid or cart empty.');
    return;
  }

  if (this.isPlacingOrder) {
    console.warn('Order request already in progress.');
    return;
  }

  this.isPlacingOrder = true;
  console.log('4. Loading started');

  const orderData = {
    items: this.cartItems,
    deliveryAddress: { ...this.address },
    paymentMethod: this.paymentMethod,
    subtotal: this.subtotal,
    discount: this.discount,
    shipping: 0,
    tax: this.tax,
    total: this.grandTotal
  };

  console.log('5. Sending POST request:', orderData);

  this.http.post<any>(
    'http://localhost:8040/order',
    orderData
  ).pipe(
    timeout(15000),
    finalize(() => {
      this.isPlacingOrder = false;
      console.log('6. Loading stopped');
    })
  ).subscribe({
    
next: (response) => {
  console.log('7. API success response:', response);

  // Confirm that the backend saved the order.
  if (!response?.order?.orderId) {
    console.error('Missing response.order.orderId');
    alert('Order response is missing the order ID.');
    return;
  }

  // Save the confirmed order for the success popup.
  this.placedOrder = response.order;
  this.saveCurrentAddress();

  localStorage.setItem(
    'niruStoreLastOrder',
    JSON.stringify(response.order)
  );

  // Clear only this logged-in user's cart.
  this.cartService.clearCart();

  // Refresh checkout's displayed cart items.
  this.loadCart();

  // Show the order success popup.
  this.orderPlaced = true;

  this.cdr.detectChanges();

  console.log('Order placed successfully.');
  console.log('Cart cleared.');
  console.log('Confirmed order:', this.placedOrder);
},

  });
}




  // ==========================================
  // SUCCESS MODAL ACTIONS
  // ==========================================

  trackOrder(): void {
    if (!this.placedOrder) {
      return;
    }

    this.orderPlaced = false;

    this.router.navigate(['/OrderTracking'], {
      queryParams: {
        orderId: this.placedOrder.orderId
      }
    });
  }

  continueShopping(): void {
    this.orderPlaced = false;
    this.router.navigate(['/Home']);
  }
}
