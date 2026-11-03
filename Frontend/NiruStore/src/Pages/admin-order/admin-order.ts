
import { CommonModule } from '@angular/common';
import { timeout, finalize } from 'rxjs';

import {
  Component,
  OnInit,ChangeDetectorRef
} from '@angular/core';

import { FormsModule } from '@angular/forms';

import {
  HttpClient,
  HttpClientModule
} from '@angular/common/http';


interface Order {
  id: string;
  customer: string;
  date: string;
  total: string;
  status: string;
  raw: any;
}


@Component({
  selector: 'app-admin-order',
  standalone: true,

  imports: [
    CommonModule,
    FormsModule,
    HttpClientModule
  ],

  templateUrl: './admin-order.html',
  styleUrl: './admin-order.css'
})
export class AdminOrder implements OnInit {

  // =====================================================
  // API
  // =====================================================

  private readonly ordersApiUrl = 'http://localhost:8040/order';


  // =====================================================
  // ORDER DATA
  // =====================================================

  orders: Order[] = [];
  filteredOrders: Order[] = [];

  isLoading = false;
  isSaving = false;

  errorMessage = '';
  successMessage = '';
  popupError = '';


  // =====================================================
  // SEARCH AND FILTER
  // =====================================================

  searchText = '';
  selectedStatus = 'All Status';


  // =====================================================
  // PAGINATION
  // =====================================================

  currentPage = 1;
  pageSize = 5;


  // =====================================================
  // POPUP STATE
  // =====================================================

  showViewPopup = false;
  showEditPopup = false;
  showDeletePopup = false;

  selectedOrder: Order | null = null;

  editStatus = 'Order Placed';


  // =====================================================
  // LIFECYCLE
  // =====================================================

  constructor(
    private http: HttpClient,
     private cdr: ChangeDetectorRef
  ) {}


  ngOnInit(): void {
    this.loadOrders();
  }


  // =====================================================
  // SUMMARY CARD COUNTS
  // =====================================================

  get orderPlacedCount(): number {
    return this.orders.filter(
      order => order.status.toLowerCase() === 'order placed'
    ).length;
  }


  get processingCount(): number {
    return this.orders.filter(
      order => order.status.toLowerCase() === 'processing'
    ).length;
  }


  get deliveredCount(): number {
    return this.orders.filter(
      order => order.status.toLowerCase() === 'delivered'
    ).length;
  }


  // =====================================================
  // LOAD ORDERS FROM BACKEND
  // =====================================================




loadOrders(): void {
  console.log('STEP 1: loadOrders() started');

  this.isLoading = true;
  this.errorMessage = '';

  this.http.get<any>(this.ordersApiUrl).subscribe({
    next: (response) => {
      console.log('STEP 2: API response received:', response);

      const ordersData = Array.isArray(response)
        ? response
        : Array.isArray(response?.orders)
          ? response.orders
          : Array.isArray(response?.data)
            ? response.data
            : null;

      if (!ordersData) {
        console.error('Unexpected response format:', response);

        this.orders = [];
        this.filteredOrders = [];
        this.errorMessage =
          'The API response does not contain an orders array.';

        this.isLoading = false;
        return;
      }

      this.orders = ordersData.map((order: any) =>
        this.mapOrder(order)
      );

      console.log('STEP 3: Mapped orders:', this.orders.length);

      this.applyFilters();

      console.log('STEP 4: Filtered orders:', this.filteredOrders.length);
      console.log('STEP 5: First mapped order:', this.orders[0]);
      console.log('STEP 6: First filtered order:', this.filteredOrders[0]);
      console.log('STEP 7: Paginated orders:', this.paginatedOrders.length);

      this.isLoading = false;
      this.cdr.detectChanges();

      console.log('STEP 8: Loading state:', this.isLoading);
    },

    error: (error) => {
      console.error('Orders API error:', error);

      this.orders = [];
      this.filteredOrders = [];

      this.errorMessage =
        error?.error?.message ||
        `Unable to load orders. HTTP status: ${error?.status ?? 'unknown'}.`;

      this.isLoading = false;
    }
  });
}





  // =====================================================
  // MAP BACKEND ORDER TO TABLE ORDER
  // =====================================================

  private mapOrder(order: any): Order {

    const orderId = String(
      order?.orderId ||
      order?._id ||
      order?.id ||
      'N/A'
    );

    const customer = String(
      order?.deliveryAddress?.fullName ||
      order?.customer?.name ||
      order?.user?.name ||
      order?.customerName ||
      order?.shippingAddress?.name ||
      order?.address?.name ||
      'Guest Customer'
    );

    const rawDate =
      order?.orderDate ||
      order?.createdAt ||
      order?.date;

    let formattedDate = 'N/A';

    if (rawDate) {

      const parsedDate = new Date(rawDate);

      if (!Number.isNaN(parsedDate.getTime())) {

        formattedDate = parsedDate.toLocaleDateString(
          'en-IN',
          {
            day: '2-digit',
            month: 'short',
            year: 'numeric'
          }
        );
      }
    }

    const totalAmount = Number(
      order?.total ??
      order?.totalAmount ??
      order?.grandTotal ??
      order?.amount ??
      order?.finalAmount ??
      0
    );

    const formattedTotal = this.formatCurrency(
      Number.isFinite(totalAmount) ? totalAmount : 0
    );

    return {
      id: orderId,
      customer,
      date: formattedDate,
      total: formattedTotal,
      status: String(
        order?.status || 'Order Placed'
      ),
      raw: order
    };
  }


  // =====================================================
  // CURRENCY FORMAT
  // =====================================================

  formatCurrency(amount: number): string {

    return new Intl.NumberFormat(
      'en-IN',
      {
        style: 'currency',
        currency: 'INR',
        maximumFractionDigits: 2
      }
    ).format(amount);
  }


  // =====================================================
  // SEARCH AND STATUS FILTER
  // =====================================================

  applyFilters(): void {

    const search = this.searchText
      .trim()
      .toLowerCase();

    this.filteredOrders = this.orders.filter(
      (order) => {

        const matchesSearch =
          !search ||
          order.id.toLowerCase().includes(search) ||
          order.customer.toLowerCase().includes(search) ||
          order.total.toLowerCase().includes(search);

        const matchesStatus =
          this.selectedStatus === 'All Status' ||
          order.status.toLowerCase() ===
            this.selectedStatus.toLowerCase();

        return matchesSearch && matchesStatus;
      }
    );

    this.currentPage = 1;
  }


  clearFilters(): void {

    this.searchText = '';
    this.selectedStatus = 'All Status';

    this.applyFilters();

    console.log('STEP 6: orders array:', this.orders);
console.log('STEP 7: filteredOrders array:', this.filteredOrders);
console.log('STEP 8: filteredOrders count:', this.filteredOrders.length);
console.log('STEP 9: isLoading:', this.isLoading);
  }


  // =====================================================
  // PAGINATION
  // =====================================================

  get totalPages(): number {

    return Math.ceil(
      this.filteredOrders.length / this.pageSize
    );
  }


  get paginatedOrders(): Order[] {

    const startIndex =
      (this.currentPage - 1) * this.pageSize;

    return this.filteredOrders.slice(
      startIndex,
      startIndex + this.pageSize
    );
  }


  get pageNumbers(): number[] {

    return Array.from(
      {
        length: this.totalPages
      },
      (_, index) => index + 1
    );
  }


  get startItem(): number {

    if (this.filteredOrders.length === 0) {
      return 0;
    }

    return (
      (this.currentPage - 1) * this.pageSize + 1
    );
  }


  get endItem(): number {

    return Math.min(
      this.currentPage * this.pageSize,
      this.filteredOrders.length
    );
  }


  goToPage(page: number): void {

    if (
      page < 1 ||
      page > this.totalPages
    ) {
      return;
    }

    this.currentPage = page;
  }


  previousPage(): void {

    this.goToPage(
      this.currentPage - 1
    );
  }


  nextPage(): void {

    this.goToPage(
      this.currentPage + 1
    );
  }


  // =====================================================
  // STATUS BADGE COLORS
  // =====================================================

  getStatusClass(status: string): string {

    switch (status.toLowerCase()) {

      case 'delivered':
        return 'bg-green-50 text-green-600';

      case 'shipped':
        return 'bg-blue-50 text-blue-600';

      case 'processing':
        return 'bg-purple-50 text-purple-600';

      case 'order placed':
        return 'bg-amber-50 text-amber-700';

      case 'pending':
        return 'bg-yellow-50 text-yellow-600';

      case 'cancelled':
      case 'canceled':
        return 'bg-red-50 text-red-600';

      default:
        return 'bg-gray-50 text-gray-600';
    }
  }


  getStatusDotClass(status: string): string {

    switch (status.toLowerCase()) {

      case 'delivered':
        return 'bg-green-500';

      case 'shipped':
        return 'bg-blue-500';

      case 'processing':
        return 'bg-purple-500';

      case 'order placed':
        return 'bg-amber-500';

      case 'pending':
        return 'bg-yellow-500';

      case 'cancelled':
      case 'canceled':
        return 'bg-red-500';

      default:
        return 'bg-gray-400';
    }
  }


  // =====================================================
  // CUSTOMER INITIALS
  // =====================================================

  getInitials(name: string): string {

    return String(name || 'Guest')
      .trim()
      .split(/\s+/)
      .filter(Boolean)
      .map(word => word.charAt(0))
      .slice(0, 2)
      .join('')
      .toUpperCase();
  }


  // =====================================================
  // OPEN VIEW POPUP
  // =====================================================

  openViewPopup(order: Order): void {

    this.selectedOrder = order;

    this.popupError = '';
    this.showEditPopup = false;
    this.showDeletePopup = false;
    this.showViewPopup = true;
  }


  // =====================================================
  // OPEN EDIT POPUP
  // =====================================================

  openEditPopup(order: Order): void {

    this.selectedOrder = order;

    this.editStatus = order.status;

    this.popupError = '';
    this.showViewPopup = false;
    this.showDeletePopup = false;
    this.showEditPopup = true;
  }


  // =====================================================
  // OPEN DELETE POPUP
  // =====================================================

  openDeletePopup(order: Order): void {

    this.selectedOrder = order;

    this.popupError = '';
    this.showViewPopup = false;
    this.showEditPopup = false;
    this.showDeletePopup = true;
  }


  // =====================================================
  // CLOSE ALL POPUPS
  // =====================================================

  closePopups(): void {

    if (this.isSaving) {
      return;
    }

    this.showViewPopup = false;
    this.showEditPopup = false;
    this.showDeletePopup = false;

    this.selectedOrder = null;
    this.popupError = '';
  }


  // =====================================================
  // SAVE UPDATED ORDER STATUS
  // =====================================================

  saveOrderStatus(): void {

    if (!this.selectedOrder || this.isSaving) {
      return;
    }

    const orderId = this.selectedOrder.id;

    const allowedStatuses = [
      'Order Placed',
      'Processing',
      'Shipped',
      'Delivered',
      'Cancelled'
    ];

    if (!allowedStatuses.includes(this.editStatus)) {

      this.popupError = 'Please select a valid order status.';
      return;
    }

    if (this.editStatus === this.selectedOrder.status) {

      this.popupError = 'Please select a different status before saving.';
      return;
    }

    this.isSaving = true;
    this.popupError = '';
    this.successMessage = '';

    this.http.put<any>(
      `${this.ordersApiUrl}/${encodeURIComponent(orderId)}`,
      {
        status: this.editStatus
      }
    ).subscribe({

      next: (response) => {

        const updatedStatus =
          response?.order?.status || this.editStatus;

        const orderToUpdate = this.orders.find(
          order => order.id === orderId
        );

        if (orderToUpdate) {

          orderToUpdate.status = updatedStatus;

          orderToUpdate.raw = {
            ...orderToUpdate.raw,
            ...(response?.order || {}),
            status: updatedStatus
          };
        }

        this.applyFilters();
        console.log('STEP 6: orders array:', this.orders);
console.log('STEP 7: filteredOrders array:', this.filteredOrders);
console.log('STEP 8: filteredOrders count:', this.filteredOrders.length);
console.log('STEP 9: isLoading:', this.isLoading);

        this.isSaving = false;

        this.showEditPopup = false;
        this.selectedOrder = null;
        this.popupError = '';

        this.successMessage =
          response?.message ||
          'Order status updated successfully.';
          this.cdr.detectChanges();

      },

      error: (error) => {

        console.error(
          'Update order error:',
          error
        );

        this.popupError =
          error?.error?.message ||
          'Unable to update order status. Check that the backend PUT route is available.';

        this.isSaving = false;
      }

    });
  }


  // =====================================================
  // CONFIRM DELETE ORDER
  // =====================================================

  confirmDeleteOrder(): void {

    if (!this.selectedOrder || this.isSaving) {
      return;
    }

    const orderId = this.selectedOrder.id;

    this.isSaving = true;
    this.popupError = '';
    this.successMessage = '';

    this.http.delete<any>(
      `${this.ordersApiUrl}/${encodeURIComponent(orderId)}`
    ).subscribe({

      next: (response) => {

        this.orders = this.orders.filter(
          order => order.id !== orderId
        );

        this.applyFilters();
        console.log('STEP 6: orders array:', this.orders);
console.log('STEP 7: filteredOrders array:', this.filteredOrders);
console.log('STEP 8: filteredOrders count:', this.filteredOrders.length);
console.log('STEP 9: isLoading:', this.isLoading);

        // Keep the page number valid after deletion.
        if (
          this.totalPages > 0 &&
          this.currentPage > this.totalPages
        ) {
          this.currentPage = this.totalPages;
        }

        this.isSaving = false;

        this.showDeletePopup = false;
        this.selectedOrder = null;
        this.popupError = '';

        this.successMessage =
          response?.message ||
          'Order deleted successfully.';

      this.cdr.detectChanges();

      },

      error: (error) => {

        console.error(
          'Delete order error:',
          error
        );

        this.popupError =
          error?.error?.message ||
          'Unable to delete the order. Check that the backend DELETE route is available.';

        this.isSaving = false;
      }

    });
  }


  // =====================================================
  // REFRESH ORDERS
  // =====================================================

  refreshOrders(): void {

    this.loadOrders();
  }

}
