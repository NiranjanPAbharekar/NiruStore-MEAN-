
import { CommonModule, CurrencyPipe, DecimalPipe } from '@angular/common';

import {
  ChangeDetectorRef,
  Component,
  OnDestroy,
  OnInit
} from '@angular/core';

import { HttpClient, HttpClientModule } from '@angular/common/http';
import { forkJoin, of, Subscription } from 'rxjs';
import { catchError } from 'rxjs/operators';

import { AdminLeftPannel } from '../../Components/admin-left-pannel/admin-left-pannel';
import { AdminTopBar } from '../../Components/admin-top-bar/admin-top-bar';
import { RouterOutlet } from '@angular/router';

interface Order {
  id: string;
  customer: string;
  product: string;
  amount: number;
  status: string;
  orderDate?: string;
}

interface DashboardProduct {
  _id?: string;
  productName?: string;
  name?: string;
  brand?: string;
  category?: string;
  image?: string;
  price?: number;
  stock?: number;
  sold?: number;
  quantitySold?: number;
  totalSold?: number;
}

interface ChartPoint {
  label: string;
  revenue: number;
  orders: number;
  customers: number;
}

interface TopProduct {
  name: string;
  image: string;
  sold: number;
  revenue: number;
}

@Component({
  selector: 'app-admin-dashboard',
  standalone: true,
  imports: [
    CommonModule,
    HttpClientModule,
    CurrencyPipe,
    DecimalPipe,
    AdminLeftPannel,
    AdminTopBar,
    RouterOutlet
  ],
  templateUrl: './admin-dashboard.html',
  styleUrl: './admin-dashboard.css'
})
export class AdminDashboard implements OnInit, OnDestroy {

  // =====================================================
  // API URLS
  // =====================================================

  private readonly productsApiUrl =
    'http://localhost:8040/Admin/AdminProducts';

  // Change these URLs if your backend uses different routes.
private readonly ordersApiUrl =
  'http://localhost:8040/order';

  private readonly usersApiUrl =
    'http://localhost:8040/api/users';

  // =====================================================
  // DASHBOARD STATE
  // =====================================================

  sidebarOpen = false;
  activeMenu = 'Dashboard';

  isLoading = false;
  dashboardError = '';
  ordersError = '';
  customersError = '';

  // =====================================================
  // DASHBOARD STATISTICS
  // =====================================================

  totalRevenue = 0;
  totalOrders = 0;
  totalCustomers = 0;
  totalProducts = 0;

  // =====================================================
  // SOURCE DATA
  // =====================================================

  products: DashboardProduct[] = [];
  orders: any[] = [];
  users: any[] = [];

  // =====================================================
  // RECENT ORDERS
  // =====================================================

  recentOrders: Order[] = [];

  // =====================================================
  // TOP-SELLING PRODUCTS
  // =====================================================

  topProducts: TopProduct[] = [];

  // =====================================================
  // SALES CHART
  // =====================================================

  selectedPeriod = 'year';

  chartPoints: ChartPoint[] = [];

  chartMaximum = 50000;

  revenuePolyline = '';
  ordersPolyline = '';
  customersPolyline = '';

  chartLabels: string[] = [];

  private subscriptions = new Subscription();

  constructor(
    private http: HttpClient,
    private cdr: ChangeDetectorRef
  ) {}

  // =====================================================
  // INITIALIZATION
  // =====================================================

  ngOnInit(): void {
    this.loadDashboard();
  }

  // =====================================================
  // LOAD DASHBOARD DATA
  // =====================================================

  loadDashboard(): void {

    this.isLoading = true;
    this.dashboardError = '';
    this.ordersError = '';
    this.customersError = '';

    const requests = forkJoin({
      products: this.http.get<any>(
        this.productsApiUrl
      ).pipe(
        catchError(error => {
          console.error('Products API error:', error);
          return of(null);
        })
      ),

      orders: this.http.get<any>(
        this.ordersApiUrl
      ).pipe(
        catchError(error => {
          console.error('Orders API error:', error);
          return of(null);
        })
      ),

      users: this.http.get<any>(
        this.usersApiUrl
      ).pipe(
        catchError(error => {
          console.error('Users API error:', error);
          return of(null);
        })
      )
    });

    this.subscriptions.add(
      requests.subscribe({
        next: response => {

          // PRODUCTS
          this.products = this.extractArray(
            response.products
          );

          this.totalProducts = this.products.length;

          // ORDERS
          if (response.orders !== null) {

            this.orders = this.extractArray(
              response.orders
            );

            this.totalOrders = this.orders.length;

            this.totalRevenue = this.orders.reduce(
              (sum, order) => {
                if (this.isCancelled(order)) {
                  return sum;
                }

                return sum + this.getOrderAmount(order);
              },
              0
            );

            this.buildRecentOrders();
            this.buildTopProducts();
            this.buildSalesChart();

          } else {

            this.orders = [];
            this.totalOrders = 0;
            this.totalRevenue = 0;
            this.recentOrders = [];
            this.topProducts = [];
            this.buildSalesChart();

            this.ordersError =
              'Orders could not be loaded. Verify the orders API URL and backend response.';
          }

          // CUSTOMERS
          if (response.users !== null) {

            this.users = this.extractArray(
              response.users
            );

            this.totalCustomers = this.users.length;

          } else {

            this.users = [];
            this.totalCustomers = 0;

            this.customersError =
              'Customers could not be loaded. Verify the users API URL.';
          }

          if (response.products === null) {
            this.dashboardError =
              'Products could not be loaded. Check the backend API and server.';
          }

          console.log('Dashboard statistics:', {
            revenue: this.totalRevenue,
            orders: this.totalOrders,
            customers: this.totalCustomers,
            products: this.totalProducts
          });

          this.isLoading = false;
          this.cdr.detectChanges();
        },

        error: error => {
          console.error('Dashboard loading error:', error);

          this.dashboardError =
            'Unable to load dashboard data.';

          this.isLoading = false;
          this.cdr.detectChanges();
        }
      })
    );
  }

  // =====================================================
  // EXTRACT ARRAY FROM COMMON API RESPONSE FORMATS
  // =====================================================

  private extractArray(response: any): any[] {

    if (Array.isArray(response)) {
      return response;
    }

    if (Array.isArray(response?.products)) {
      return response.products;
    }

    if (Array.isArray(response?.orders)) {
      return response.orders;
    }

    if (Array.isArray(response?.users)) {
      return response.users;
    }

    if (Array.isArray(response?.data)) {
      return response.data;
    }

    if (Array.isArray(response?.results)) {
      return response.results;
    }

    return [];
  }

  // =====================================================
  // GET ORDER AMOUNT
  // =====================================================

  private getOrderAmount(order: any): number {

    const possibleAmounts = [
      order?.total,
      order?.totalAmount,
      order?.grandTotal,
      order?.amount,
      order?.finalAmount
    ];

    for (const value of possibleAmounts) {
      if (
        value !== undefined &&
        value !== null &&
        value !== '' &&
        Number.isFinite(Number(value))
      ) {
        return Math.max(0, Number(value));
      }
    }

    return 0;
  }

  // =====================================================
  // CANCELLED ORDERS
  // =====================================================

  private isCancelled(order: any): boolean {

    const status = String(
      order?.status || order?.orderStatus || ''
    ).toLowerCase();

    return [
      'cancelled',
      'canceled',
      'refunded'
    ].includes(status);
  }

  // =====================================================
  // GET ORDER DATE
  // =====================================================

  private getOrderDate(order: any): Date | null {

    const value =
      order?.orderDate ||
      order?.createdAt ||
      order?.date ||
      order?.updatedAt;

    if (!value) {
      return null;
    }

    const date = new Date(value);

    return Number.isNaN(date.getTime())
      ? null
      : date;
  }

  // =====================================================
  // GET ORDER ID
  // =====================================================

  private getOrderId(order: any): string {

    return String(
      order?.orderId ||
      order?.id ||
      order?._id ||
      'N/A'
    );
  }

  // =====================================================
  // GET CUSTOMER NAME
  // =====================================================

  private getCustomerName(order: any): string {

    const customer = order?.customer || order?.user;

    if (typeof customer === 'string') {
      return customer;
    }

    return String(
      customer?.name ||
      customer?.fullName ||
      order?.customerName ||
      order?.shippingAddress?.name ||
      order?.address?.name ||
      'Guest Customer'
    );
  }

  // =====================================================
  // GET PRODUCT NAME FROM ORDER
  // =====================================================


private getOrderItems(order: any): any[] {
  const possibleItems = [
    order?.items,
    order?.products,
    order?.orderItems,
    order?.cartItems,
    order?.lineItems,
    order?.orderDetails
  ];

  return possibleItems.find(
    (items: any) => Array.isArray(items)
  ) ?? [];
}

private getProductName(item: any): string {
  const product =
    item?.product ??
    item?.productDetails ??
    item?.productId ??
    item?.item;

  if (typeof product === 'string') {
    return String(
      item?.productName ??
      item?.name ??
      'Product'
    );
  }

  return String(
    item?.productName ??
    item?.name ??
    product?.productName ??
    product?.name ??
    product?.title ??
    'Product'
  );
}

private getOrderProductNames(order: any): string[] {
  return this.getOrderItems(order).map(
    (item: any) => this.getProductName(item)
  );
}

  // =====================================================
  // BUILD RECENT ORDERS
  // =====================================================

private buildRecentOrders(): void {
  this.recentOrders = [...this.orders]
    .sort((a: any, b: any) => {
      const dateA = this.getOrderDate(a)?.getTime() ?? 0;
      const dateB = this.getOrderDate(b)?.getTime() ?? 0;

      return dateB - dateA;
    })
    .slice(0, 5)
    .map((order: any) => {
      const productNames = this.getOrderProductNames(order);

      return {
        id: this.getOrderId(order),
        customer: this.getCustomerName(order),
        product: productNames.length
          ? productNames.join(', ')
          : 'Product details unavailable',
        amount: this.getOrderAmount(order),
        status: String(
          order?.status ??
          order?.orderStatus ??
          'Pending'
        ),
        orderDate:
          this.getOrderDate(order)?.toISOString() ?? ''
      };
    });

  console.log('Recent orders:', this.recentOrders);
}


  // =====================================================
  // BUILD TOP PRODUCTS
  // =====================================================

private buildTopProducts(): void {
  const productMap = new Map<string, TopProduct>();

  this.orders.forEach((order: any) => {
    if (this.isCancelled(order)) {
      return;
    }

    const items = this.getOrderItems(order);

    items.forEach((item: any) => {
      const product =
        item?.product ??
        item?.productDetails ??
        item?.productId ??
        item?.item;

      const name = this.getProductName(item);

      const quantityValue =
        item?.quantity ??
        item?.qty ??
        item?.count ??
        1;

      const quantity = Math.max(
        0,
        Number(quantityValue) || 0
      );

      const priceValue =
        item?.discountPrice ??
        item?.price ??
        item?.sellingPrice ??
        product?.discountedPrice ??
        product?.discountPrice ??
        product?.price ??
        0;

      const price = Math.max(
        0,
        Number(priceValue) || 0
      );

      const image = String(
        item?.image ??
        product?.image ??
        product?.images?.[0] ??
        ''
      );

      const existing = productMap.get(name);

      if (existing) {
        existing.sold += quantity;
        existing.revenue += price * quantity;

        if (!existing.image && image) {
          existing.image = image;
        }
      } else {
        productMap.set(name, {
          name,
          image,
          sold: quantity,
          revenue: price * quantity
        });
      }
    });
  });

  this.topProducts = Array.from(productMap.values())
    .sort((a, b) => b.sold - a.sold)
    .slice(0, 5);

  console.log('Top-selling products:', this.topProducts);
}
get chartLabelInterval(): number {
  return Math.max(
    1,
    Math.ceil(this.chartLabels.length / 10)
  );
}


  // =====================================================
  // CHANGE CHART PERIOD
  // =====================================================

  changePeriod(period: string): void {

    this.selectedPeriod = period;

    this.buildSalesChart();

    this.cdr.detectChanges();
  }

  // =====================================================
  // BUILD SALES CHART FROM ORDERS
  // =====================================================

  private buildSalesChart(): void {

    const now = new Date();
    const points: ChartPoint[] = [];

    if (this.selectedPeriod === 'week') {

      const start = new Date(now);
      start.setDate(now.getDate() - 6);
      start.setHours(0, 0, 0, 0);

      for (let i = 0; i < 7; i++) {

        const date = new Date(start);
        date.setDate(start.getDate() + i);

        points.push({
          label: date.toLocaleDateString('en-IN', {
            weekday: 'short'
          }),
          revenue: 0,
          orders: 0,
          customers: 0
        });
      }

      this.orders.forEach(order => {

        const date = this.getOrderDate(order);

        if (!date || this.isCancelled(order)) {
          return;
        }

        const index = Math.floor(
          (new Date(
            date.getFullYear(),
            date.getMonth(),
            date.getDate()
          ).getTime() -
            new Date(
              start.getFullYear(),
              start.getMonth(),
              start.getDate()
            ).getTime()) /
            86400000
        );

        if (index >= 0 && index < 7) {
          points[index].revenue += this.getOrderAmount(order);
          points[index].orders++;

          const customerId =
            order?.user?._id ||
            order?.userId ||
            order?.customer?._id ||
            order?.customerId ||
            this.getCustomerName(order);

          if (customerId) {
            points[index].customers++;
          }
        }
      });

    } else {

      const monthCount =
        this.selectedPeriod === 'month' ? 30 : 12;

      if (this.selectedPeriod === 'month') {

        for (let i = monthCount - 1; i >= 0; i--) {

          const date = new Date(now);
          date.setDate(now.getDate() - i);

          points.push({
            label: date.toLocaleDateString('en-IN', {
              day: 'numeric',
              month: 'short'
            }),
            revenue: 0,
            orders: 0,
            customers: 0
          });
        }

        this.orders.forEach(order => {

          const date = this.getOrderDate(order);

          if (!date || this.isCancelled(order)) {
            return;
          }

          const index = points.findIndex(point =>
            point.label === date.toLocaleDateString('en-IN', {
              day: 'numeric',
              month: 'short'
            })
          );

          if (index >= 0) {
            points[index].revenue += this.getOrderAmount(order);
            points[index].orders++;
            points[index].customers++;
          }
        });

      } else {

        for (let i = 11; i >= 0; i--) {

          const date = new Date(
            now.getFullYear(),
            now.getMonth() - i,
            1
          );

          points.push({
            label: date.toLocaleDateString('en-IN', {
              month: 'short'
            }),
            revenue: 0,
            orders: 0,
            customers: 0
          });
        }

        this.orders.forEach(order => {

          const date = this.getOrderDate(order);

          if (!date || this.isCancelled(order)) {
            return;
          }

          const index =
            (date.getFullYear() * 12 + date.getMonth()) -
            ((now.getFullYear() * 12 + now.getMonth()) - 11);

          if (index >= 0 && index < 12) {
            points[index].revenue += this.getOrderAmount(order);
            points[index].orders++;
            points[index].customers++;
          }
        });
      }
    }

    this.chartPoints = points;
    this.chartLabels = points.map(point => point.label);

    const maxRevenue = Math.max(
      0,
      ...points.map(point => point.revenue)
    );

    this.chartMaximum = maxRevenue > 0
      ? Math.ceil(maxRevenue / 1000) * 1000
      : 1000;

    this.revenuePolyline = this.createPolyline(
      points.map(point => point.revenue),
      this.chartMaximum
    );

    this.ordersPolyline = this.createPolyline(
      points.map(point => point.orders),
      Math.max(1, ...points.map(point => point.orders))
    );

    this.customersPolyline = this.createPolyline(
      points.map(point => point.customers),
      Math.max(1, ...points.map(point => point.customers))
    );
  }

  // =====================================================
  // GENERATE SVG CHART POINTS
  // =====================================================

  private createPolyline(
    values: number[],
    maximum: number
  ): string {

    if (!values.length) {
      return '';
    }

    const width = 700;
    const height = 260;

    return values.map((value, index) => {

      const x = values.length === 1
        ? width / 2
        : (index / (values.length - 1)) * width;

      const y = height -
        (Math.max(0, value) / maximum) * (height - 10);

      return `${x},${y}`;
    }).join(' ');
  }

  // =====================================================
  // FORMAT CHART VALUES
  // =====================================================

  formatChartValue(value: number): string {

    return '₹' + Number(value || 0).toLocaleString('en-IN');
  }

  // =====================================================
  // IMAGE FALLBACK
  // =====================================================

  onProductImageError(event: Event): void {

    const image = event.target as HTMLImageElement;

    image.onerror = null;
    image.src =
      'https://placehold.co/100x100/f5f3ef/777?text=Product';
  }

  // =====================================================
  // SIDEBAR
  // =====================================================

  openSidebar(): void {
    this.sidebarOpen = true;
  }

  closeSidebar(): void {
    this.sidebarOpen = false;
  }

  setActiveMenu(menu: string): void {
    this.activeMenu = menu;
    this.sidebarOpen = false;
  }

  // =====================================================
  // LOGOUT
  // =====================================================

  logout(): void {
    localStorage.removeItem('user');
    console.log('Admin logged out');
  }

  // =====================================================
  // CLEANUP
  // =====================================================

  ngOnDestroy(): void {
    this.subscriptions.unsubscribe();
  }
}
