
import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { Component, OnInit ,ChangeDetectorRef} from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { finalize, timeout } from 'rxjs';


// =========================================================
// ORDER ITEM INTERFACE
// =========================================================

interface OrderItem {
  id?: string;
  _id?: string;
  name?: string;
  productName?: string;
  brand?: string;
  image?: string;
  productImage?: string;
  price?: number;
  quantity?: number;
}

// =========================================================
// DELIVERY ADDRESS INTERFACE
// =========================================================

interface DeliveryAddress {
  name?: string;
  fullName?: string;
  email?: string;

  // Phone number fields
  mobile?: string;
  phone?: string;

  street?: string;
  address?: string;
  addressLine1?: string;
  addressLine2?: string;

  city?: string;
  state?: string;

  zip?: string;
  postalCode?: string;
  pincode?: string;
}

// =========================================================
// ORDER DATA INTERFACE
// =========================================================

interface OrderData {
  _id: string;
  orderId: string;
  items: OrderItem[];

  deliveryAddress?: DeliveryAddress | string;

  paymentMethod?: string;

  subtotal?: number;
  discount?: number;
  shipping?: number;
  tax?: number;
  total?: number;
  totalAmount?: number;

  status?: string;
  createdAt?: string;
  updatedAt?: string;

  // Support older field names if present
  orderNumber?: string;

  customer?: {
    name?: string;
    email?: string;
    phone?: string;
    address?: DeliveryAddress;
  };

  customerName?: string;
  customerEmail?: string;
  phone?: string;
  address?: string;
  city?: string;
  state?: string;
  zip?: string;
}

// =========================================================
// ORDER TRACKING COMPONENT
// =========================================================

@Component({
  selector: 'app-order-tracking',
  standalone: true,
  imports: [CommonModule, FormsModule,RouterLink],
  templateUrl: './order-tracking.html',
  styleUrl: './order-tracking.css'
})
export class OrderTracking implements OnInit {

  // =======================================================
  // API URL
  // =======================================================

  private readonly API_URL = 'https://nirustore-mean-1.onrender.com/order';

  // =======================================================
  // COMPONENT PROPERTIES
  // =======================================================

  orderId = '';

  order: OrderData | null = null;

  showOrder = false;

  loading = false;

  errorMessage = '';

  steps: string[] = [
    'Order Placed',
    'Processing',
    'Shipped',
    'Delivered'
  ];

  // =======================================================
  // CONSTRUCTOR
  // =======================================================

  constructor(
    private http: HttpClient,
    private route: ActivatedRoute,
     private cdr: ChangeDetectorRef
  ) {}

  // =======================================================
  // READ ORDER ID FROM URL
  // =======================================================

  ngOnInit(): void {

    this.route.queryParamMap.subscribe(params => {

      const queryOrderId = params.get('orderId');

      console.log('Order ID from URL:', queryOrderId);

      if (queryOrderId) {

        this.orderId = queryOrderId.trim();

        this.trackOrder();

      } else {

        this.loading = false;
        this.showOrder = false;
        this.order = null;

        this.errorMessage =
          'Order ID is missing. Please open order tracking using your order ID.';

      }

    });

  }

  // =======================================================
  // TRACK ORDER
  // =======================================================


trackOrder(): void {
  const id = this.orderId.trim();

  if (!id) {
    this.loading = false;
    this.showOrder = false;
    this.order = null;
    this.errorMessage = 'Please enter your Order ID.';
    return;
  }

  this.loading = true;
  this.errorMessage = '';
  this.showOrder = false;
  this.order = null;

  console.log('TRACKING STARTED:', id);

  this.http
    .get<any>(`${this.API_URL}/${encodeURIComponent(id)}`)
    .pipe(
      timeout(15000),
      finalize(() => {
        this.loading = false;
          this.cdr.detectChanges();
        console.log('TRACKING FINISHED. Loading:', this.loading);
      })
    )
    .subscribe({
      next: (response) => {
        console.log('TRACKING SUCCESS:', response);

        const data = response?.order ?? response;

        if (!data?.orderId) {
          this.errorMessage =
            'The API responded, but the order ID is missing in its response.';
          this.showOrder = false;
          this.order = null;
          return;
        }

        this.order = data;
        this.orderId = data.orderId;
        this.showOrder = true;

this.cdr.detectChanges();

        console.log('ORDER ASSIGNED:', this.order);
        console.log('SHOW ORDER:', this.showOrder);
      },

      error: (error) => {
        console.error('TRACKING ERROR:', error);

        this.errorMessage =
          error.name === 'TimeoutError'
            ? 'The request timed out after 15 seconds.'
            : error.status === 404
              ? 'Order not found. Check the order ID.'
              : error.status === 0
                ? 'Cannot connect to the backend.'
                : error.error?.message ||
                  `Request failed with status ${error.status}.`;

        this.order = null;
        this.showOrder = false;
        this.cdr.detectChanges();
      }
    });
}


  // =======================================================
  // REFRESH ORDER DETAILS
  // =======================================================

  refreshOrder(): void {

    this.trackOrder();

  }

  // =======================================================
  // DELIVERY ADDRESS
  // =======================================================

  get deliveryAddress(): DeliveryAddress {

    const address = this.order?.deliveryAddress;

    // If the address is stored as a string
    if (typeof address === 'string') {

      return {
        address
      };

    }

    // If the address is stored as an object
    return address ||
      this.order?.customer?.address ||
      {
        address: this.order?.address,
        city: this.order?.city,
        state: this.order?.state,
        zip: this.order?.zip
      };

  }

  // =======================================================
  // CUSTOMER NAME
  // =======================================================

  get customerName(): string {

    const address = this.deliveryAddress;

    return address.fullName ||
      address.name ||
      this.order?.customer?.name ||
      this.order?.customerName ||
      'N/A';

  }

  // =======================================================
  // CUSTOMER PHONE
  // =======================================================
get customerPhone(): string {

  return this.deliveryAddress.mobile ||
    this.deliveryAddress.phone ||
    this.order?.customer?.phone ||
    this.order?.phone ||
    'N/A';

}

  // =======================================================
  // FORMATTED DELIVERY ADDRESS
  // =======================================================

  get formattedAddress(): string {

    const a = this.deliveryAddress;

    return [
      a.addressLine1,
      a.addressLine2,
      a.street,
      a.address,
      a.city,
      a.state,
      a.postalCode || a.pincode || a.zip
    ]
      .filter(Boolean)
      .filter(
        (value, index, array) =>
          array.indexOf(value) === index
      )
      .join(', ');

  }

  // =======================================================
  // ORDER TOTAL
  // =======================================================

  calculateTotal(): number {

    if (!this.order?.items) {

      return 0;

    }

    return this.order.items.reduce(

      (sum, item) =>

        sum +
        Number(item.price || 0) *
        Number(item.quantity || 1),

      0

    );

  }

  // =======================================================
  // DISPLAY TOTAL
  // =======================================================

  get orderTotal(): number {

    return Number(
      this.order?.total ??
      this.order?.totalAmount ??
      (
        this.calculateTotal() -
        Number(this.order?.discount || 0) +
        Number(this.order?.shipping || 0) +
        Number(this.order?.tax || 0)
      )
    );

  }

  // =======================================================
  // CURRENT STATUS STEP
  // =======================================================

  getStepIndex(): number {

    const status = (
      this.order?.status || 'Order Placed'
    )
      .toLowerCase()
      .trim();

    // Cancelled orders do not follow the normal progress steps
    if (
      [
        'cancelled',
        'canceled',
        'refunded'
      ].includes(status)
    ) {

      return -1;

    }

    switch (status) {

      case 'pending':
      case 'order placed':

        return 0;

      case 'processing':
      case 'confirmed':

        return 1;

      case 'shipped':
      case 'out for delivery':

        return 2;

      case 'delivered':

        return 3;

      default:

        return 0;

    }

  }

}
