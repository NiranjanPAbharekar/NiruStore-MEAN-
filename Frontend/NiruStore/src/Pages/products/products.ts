import { CommonModule } from '@angular/common';
import {
  Component,
  OnInit,
  ChangeDetectorRef
} from '@angular/core';
import { FormsModule } from '@angular/forms';
import {
  HttpClient,
  HttpClientModule
} from '@angular/common/http';
import { ActivatedRoute, Router } from '@angular/router';

import {
  WishlistService,
  WishlistProduct
} from '../../Service/wishlist-product';

import {
  CartProduct,
  CartService
} from '../../Service/cart-product';



// =========================================================
// PRODUCT INTERFACE
// =========================================================

interface Product {
  _id?: string;
  productName: string;
  brand: string;
  category: string;
  description: string;
  image: string;
  price: number;
  oldPrice?: number;
  discountPrice: number;
  rating: number;
  reviews: number;
  badge?: string;
  color: string;
  stock: number;
  isFavourite: boolean;
  quantity?: number;
  images?: string[];
}

// =========================================================
// FILTER ITEM
// =========================================================

interface FilterItem {
  name: string;
  count: number;
}

// =========================================================
// COMPONENT
// =========================================================

@Component({
  selector: 'app-products',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    HttpClientModule
  ],
  templateUrl: './products.html',
  styleUrl: './products.css'
})
export class Products implements OnInit {

  // =========================================================
  // GENERAL
  // =========================================================

  Math = Math;
  isFilterDrawerOpen = false;

  private apiUrl =
    'http://localhost:8040/Admin/AdminProducts';

  loading = false;

  // =========================================================
  // PRODUCTS
  // =========================================================

  products: Product[] = [];
  filteredProducts: Product[] = [];
  paginatedProducts: Product[] = [];

  // =========================================================
  // SEARCH
  // =========================================================

  searchText = '';

  // =========================================================
  // CATEGORY
  // =========================================================

  selectedCategory = 'All';
  categories: FilterItem[] = [];

  // =========================================================
  // BRAND
  // =========================================================

  selectedBrand = 'All';
  brands: FilterItem[] = [];

  // =========================================================
  // PRICE
  // =========================================================

  minProductPrice = 0;
  maxProductPrice = 150000;
  maxPrice = 150000;

  // =========================================================
  // COLOR
  // =========================================================

  colors: string[] = [];
  selectedColor = '';

  // =========================================================
  // RATING
  // =========================================================

  ratings = [5, 4, 3, 2, 1];
  selectedRating = 0;

  // =========================================================
  // SORT
  // =========================================================

  sortOption = 'popular';

  // =========================================================
  // PAGINATION
  // =========================================================

  currentPage = 1;
  itemsPerPage = 6;
  totalPages = 1;
  pages: number[] = [];

  // =========================================================
  // CART & WISHLIST
  // =========================================================

  cart: Product[] = [];
  wishlist: Product[] = [];

  // =========================================================
  // CONSTRUCTOR
  // =========================================================

  constructor(
    private http: HttpClient,
    private cdr: ChangeDetectorRef,
    private route: ActivatedRoute,
      private router: Router,
    private wishlistService: WishlistService,
    private cartService: CartService
  ) {}

  // OPEN PRODUCT DETAILS PAGE

openProductDetails(product: Product): void {
  console.log('PRODUCT CLICKED:', product);
  console.log('PRODUCT ID:', product?._id);

  if (!product?._id) {
    console.error('Cannot open details: product ID is missing.');
    return;
  }

  this.router.navigate(['/ProductDetails', product._id])
    .then((success: boolean) => {
      console.log('Product details navigation:', success);
      console.log('Current URL:', this.router.url);
    })
    .catch((error: unknown) => {
      console.error('Product navigation failed:', error);
    });
}


  // =========================================================
  // INITIALIZATION
  // =========================================================

  ngOnInit(): void {

    // CART SYNCHRONIZATION
    this.cartService.cart$.subscribe(cart => {
      this.cart = cart.map(item => ({
        _id: item._id,
        productName: item.productName,
        brand: item.brand,
        category: item.category,
        description: item.description,
        image: item.image,
        price: item.price,
        oldPrice: item.oldPrice,
        discountPrice: item.discountPrice ?? item.price,
        rating: item.rating ?? 0,
        reviews: item.reviews ?? 0,
        badge: item.badge ?? '',
        color: item.color ?? '',
        stock: item.stock ?? 0,
        isFavourite: item._id
          ? this.wishlistService.isInWishlist(item._id)
          : false,
        quantity: item.quantity ?? 1
      }));

      this.cdr.detectChanges();
    });

    // READ CATEGORY FROM URL
    this.route.queryParams.subscribe(params => {
      const category = params['category'];

      this.selectedCategory = category
        ? this.normalizeCategory(category)
        : 'All';

      this.getProducts();
    });

    // WISHLIST SYNCHRONIZATION
    this.wishlistService.wishlist$.subscribe(wishlist => {
      this.wishlist = wishlist as Product[];

      this.products.forEach(product => {
        product.isFavourite = product._id
          ? this.wishlistService.isInWishlist(product._id)
          : false;
      });

      this.cdr.detectChanges();
    });
  }

  // =========================================================
  // FILTER DRAWER
  // =========================================================

  openFilterDrawer(): void {
    this.isFilterDrawerOpen = true;
  }

  closeFilterDrawer(): void {
    this.isFilterDrawerOpen = false;
  }

  // =========================================================
  // NORMALIZE CATEGORY
  // =========================================================

normalizeCategory(category: string): string {

  const value = String(category ?? '')
    .trim()
    .toLowerCase()
    .replace(/[-_]+/g, ' ')
    .replace(/\s+/g, ' ');

  if (!value || value === 'all') {
    return 'All';
  }

  const categoryMap: Record<string, string> = {

    // PERFUMES
    'perfume': 'Perfume',
    'perfumes': 'Perfume',
    'fragrance': 'Perfume',
    'fragrances': 'Perfume',

    // WATCHES
    'watch': 'Watches',
    'watches': 'Watches',

    // SHOES
    'shoe': 'Shoes',
    'shoes': 'Shoes',
    'footwear': 'Shoes',

    // SHIRTS
    'shirt': 'Shirt',
    'shirts': 'Shirt',

    // CLOTHING
    'clothing': 'Clothing',
    'clothes': 'Clothing',

    // MEN FASHION
    'menclothing': 'MenClothing',
    'men clothing': 'MenClothing',
    'mens clothing': 'MenClothing',
    "men's clothing": 'MenClothing',
    'men fashion': 'MenClothing',
    'mens fashion': 'MenClothing',
    "men's fashion": 'MenClothing',

    // WOMEN FASHION
    'womenclothing': 'WomenClothing',
    'women clothing': 'WomenClothing',
    'womens clothing': 'WomenClothing',
    "women's clothing": 'WomenClothing',
    'women fashion': 'WomenClothing',
    'womens fashion': 'WomenClothing',
    "women's fashion": 'WomenClothing',

    // BAGS
    'bag': 'Bags',
    'bags': 'Bags',

    // ACCESSORIES
    'accessory': 'Accessories',
    'accessories': 'Accessories'
  };

  return categoryMap[value] || value;
}

  // =========================================================
  // CHECK CATEGORY SELECTION
  // Use this in your HTML category checkbox.
  // =========================================================

  isCategorySelected(category: string): boolean {
    return (
      this.normalizeCategory(this.selectedCategory).toLowerCase() ===
      this.normalizeCategory(category).toLowerCase()
    );
  }

  // =========================================================
  // GET PRODUCTS FROM BACKEND
  // =========================================================

  getProducts(): void {

    this.loading = true;
    this.cdr.detectChanges();

    this.http.get<any>(this.apiUrl).subscribe({

      next: (response) => {

        console.log('PRODUCT API RESPONSE:', response);

        // Supports the existing API response format.
        if (
          response &&
          response.status === 'success' &&
          Array.isArray(response.products)
        ) {

          this.products = response.products.map(
            (product: any, index: number) =>
              this.mapProduct(product, index)
          );

        } else if (Array.isArray(response)) {

          // Also support an API returning the products array directly.
          this.products = response.map(
            (product: any, index: number) =>
              this.mapProduct(product, index)
          );

        } else {

          console.warn('Invalid product API response:', response);

          this.products = [];
        }

        // Build filters from the loaded products.
        this.createFilters();

        // Set price range.
        this.setInitialPriceRange();

        // Apply selected category and other filters.
        this.currentPage = 1;
        this.applyFilters();

        this.loading = false;
        this.cdr.detectChanges();
      },

      error: (error) => {

        console.error('PRODUCT API ERROR:', error);

        this.loading = false;
        this.products = [];
        this.filteredProducts = [];
        this.paginatedProducts = [];

        this.calculatePagination();
        this.updatePagination();

        this.cdr.detectChanges();
      }
    });
  }

  // =========================================================
  // MAP BACKEND PRODUCT
  // =========================================================


mapProduct(product: any, index: number): Product {

  const productId = product._id
    ? String(product._id)
    : undefined;

  const price = Number(product.price) || 0;

  let discountPrice = Number(product.discountPrice);

  if (
    !Number.isFinite(discountPrice) ||
    discountPrice <= 0
  ) {
    const discount = Number(product.discount) || 0;

    if (discount > 0 && discount < 100) {
      discountPrice = price - (price * discount / 100);
    } else {
      discountPrice = price;
    }
  }

  const oldPrice = Number(product.oldPrice) > 0
    ? Number(product.oldPrice)
    : undefined;

  let image = product.image || '';

  if (typeof image !== 'string' || !image.trim()) {
    image = 'assets/products/default.jpg';
  }

  const images: string[] = Array.isArray(product.images)
    ? product.images.filter(
        (img: any): img is string =>
          typeof img === 'string' && img.trim().length > 0
      )
    : [];

  // Include the main image in the gallery.
  const allImages = Array.from(
    new Set([image, ...images])
  );

  return {
    _id: productId,

    productName:
      product.productName ||
      product.name ||
      'Product',

    brand: product.brand || 'Unknown Brand',

    category: product.category || 'Other',

    description: product.description || '',

    image,

    images: allImages,

    price,

    oldPrice,

    discountPrice,

    rating: Number(product.rating) || 0,

    reviews: Number(product.reviews) || 0,

    badge: product.badge || '',

    color: product.color || '',

    stock: this.convertStock(product.stock),

    isFavourite: productId
      ? this.wishlistService.isInWishlist(productId)
      : false,

    quantity: 0
  };
}


  // =========================================================
  // CONVERT STOCK TO NUMBER
  // =========================================================

  convertStock(value: any): number {

    if (typeof value === 'number') {
      return Math.max(0, value);
    }

    if (typeof value === 'string') {
      const stock = Number(value);

      return Number.isFinite(stock)
        ? Math.max(0, stock)
        : 0;
    }

    if (typeof value === 'boolean') {
      return value ? 1 : 0;
    }

    return 0;
  }

  // =========================================================
  // CREATE CATEGORY, BRAND & COLOR FILTERS
  // =========================================================

  createFilters(): void {

    // CATEGORY
    // Combine categories such as Perfume and Perfumes.
    const categoryMap = new Map<string, number>();

    this.products.forEach(product => {

      const category = this.normalizeCategory(product.category);

      if (category && category !== 'All') {
        categoryMap.set(
          category,
          (categoryMap.get(category) || 0) + 1
        );
      }
    });

    this.categories = Array.from(categoryMap.entries()).map(
      ([name, count]) => ({
        name,
        count
      })
    );

    // BRAND
    // Combine the same brand even if its casing differs.
    const brandMap = new Map<string, number>();

    this.products.forEach(product => {

      const brand = String(product.brand || '').trim();

      if (!brand) {
        return;
      }

      const existing = Array.from(brandMap.keys()).find(
        value => value.toLowerCase() === brand.toLowerCase()
      );

      const key = existing || brand;

      brandMap.set(
        key,
        (brandMap.get(key) || 0) + 1
      );
    });

    this.brands = Array.from(brandMap.entries()).map(
      ([name, count]) => ({
        name,
        count
      })
    );

    // COLORS
    this.colors = Array.from(
      new Set(
        this.products
          .map(product => String(product.color || '').trim())
          .filter(color => !!color)
      )
    );

    console.log('CATEGORIES:', this.categories);
    console.log('BRANDS:', this.brands);
    console.log('COLORS:', this.colors);
  }

  // =========================================================
  // INITIAL PRICE RANGE
  // =========================================================

  setInitialPriceRange(): void {

    this.minProductPrice = 0;

    if (this.products.length === 0) {
      this.maxProductPrice = 150000;
      this.maxPrice = 150000;
      return;
    }

    const prices = this.products
      .map(product => Number(product.price))
      .filter(price => Number.isFinite(price));

    if (prices.length > 0) {

      const highestPrice = Math.max(...prices);

      this.maxProductPrice = Math.max(
        150000,
        highestPrice
      );

      this.maxPrice = this.maxProductPrice;
    }
  }

  // =========================================================
  // APPLY ALL FILTERS
  // =========================================================

  applyFilters(): void {

    const search = this.searchText
      .toLowerCase()
      .trim();

    const selectedCategory = this.normalizeCategory(
      this.selectedCategory
    ).toLowerCase().trim();

    this.filteredProducts = this.products.filter(product => {

      // SEARCH
      const matchesSearch =
        !search ||
        String(product.productName || '')
          .toLowerCase()
          .includes(search) ||
        String(product.brand || '')
          .toLowerCase()
          .includes(search) ||
        String(product.category || '')
          .toLowerCase()
          .includes(search) ||
        String(product.description || '')
          .toLowerCase()
          .includes(search);

      // CATEGORY
      // Normalize both sides to handle singular/plural category names.
      const productCategory = this.normalizeCategory(
        product.category
      ).toLowerCase().trim();

      const matchesCategory =
        selectedCategory === 'all' ||
        productCategory === selectedCategory;

      // BRAND
      const matchesBrand =
        this.selectedBrand === 'All' ||
        String(product.brand || '')
          .toLowerCase()
          .trim() ===
        String(this.selectedBrand || '')
          .toLowerCase()
          .trim();

      // PRICE
      const productPrice = Number(product.price);
      const selectedPrice = Number(this.maxPrice);

      const matchesPrice =
        productPrice <= selectedPrice;

      // COLOR
      const matchesColor =
        !this.selectedColor ||
        String(product.color || '').trim() ===
        String(this.selectedColor || '').trim();

      // RATING
      const matchesRating =
        this.selectedRating === 0 ||
        Number(product.rating) >= this.selectedRating;

      return (
        matchesSearch &&
        matchesCategory &&
        matchesBrand &&
        matchesPrice &&
        matchesColor &&
        matchesRating
      );
    });

    // SORT
    this.sortProducts();

    // RESET PAGINATION
    this.currentPage = 1;

    // UPDATE PAGINATION
    this.calculatePagination();
    this.updatePagination();

    console.log('SELECTED CATEGORY:', this.selectedCategory);
    console.log('FILTERED PRODUCTS:', this.filteredProducts.length);
  }

  // =========================================================
  // SEARCH PRODUCT
  // =========================================================

  searchProduct(): void {
    this.applyFilters();
  }

  // =========================================================
  // CATEGORY FILTER
  // =========================================================

  toggleCategory(category: string): void {

    const clickedCategory = this.normalizeCategory(category);
    const currentCategory = this.normalizeCategory(
      this.selectedCategory
    );

    if (
      currentCategory.toLowerCase() ===
      clickedCategory.toLowerCase()
    ) {
      this.selectedCategory = 'All';
    } else {
      this.selectedCategory = clickedCategory;
    }

    this.applyFilters();
  }

  // =========================================================
  // BRAND FILTER
  // =========================================================

  toggleBrand(brand: string): void {

    this.selectedBrand =
      this.selectedBrand.toLowerCase() === brand.toLowerCase()
        ? 'All'
        : brand;

    this.applyFilters();
  }

  // =========================================================
  // COLOR FILTER
  // =========================================================

  selectColor(color: string): void {

    this.selectedColor =
      this.selectedColor === color
        ? ''
        : color;

    this.applyFilters();
  }

  // =========================================================
  // RATING FILTER
  // =========================================================

  filterRating(rating: number): void {

    this.selectedRating = rating;

    this.applyFilters();
  }

  // =========================================================
  // SORT PRODUCTS
  // =========================================================

  sortProducts(): void {

    if (this.sortOption === 'priceLow') {

      this.filteredProducts.sort(
        (a, b) => a.price - b.price
      );

    } else if (this.sortOption === 'priceHigh') {

      this.filteredProducts.sort(
        (a, b) => b.price - a.price
      );

    } else if (this.sortOption === 'rating') {

      this.filteredProducts.sort(
        (a, b) => b.rating - a.rating
      );

    } else {

      // Popular
      this.filteredProducts.sort(
        (a, b) => b.reviews - a.reviews
      );
    }
  }

  // =========================================================
  // CALCULATE PAGINATION
  // =========================================================

  calculatePagination(): void {

    this.totalPages = Math.max(
      1,
      Math.ceil(
        this.filteredProducts.length / this.itemsPerPage
      )
    );

    this.pages = Array.from(
      { length: this.totalPages },
      (_, index) => index + 1
    );

    // If filtering removes items from the last page,
    // keep currentPage inside the valid range.
    if (this.currentPage > this.totalPages) {
      this.currentPage = this.totalPages;
    }
  }

  // =========================================================
  // UPDATE PAGINATED PRODUCTS
  // =========================================================

  updatePagination(): void {

    const start =
      (this.currentPage - 1) * this.itemsPerPage;

    this.paginatedProducts = this.filteredProducts.slice(
      start,
      start + this.itemsPerPage
    );
  }

  // =========================================================
  // GO TO PAGE
  // =========================================================

  goToPage(page: number): void {

    if (page < 1 || page > this.totalPages) {
      return;
    }

    this.currentPage = page;
    this.updatePagination();
  }

  // =========================================================
  // NEXT PAGE
  // =========================================================

  nextPage(): void {

    if (this.currentPage < this.totalPages) {
      this.currentPage++;
      this.updatePagination();
    }
  }

  // =========================================================
  // PREVIOUS PAGE
  // =========================================================

  previousPage(): void {

    if (this.currentPage > 1) {
      this.currentPage--;
      this.updatePagination();
    }
  }

  // =========================================================
  // ADD TO CART
  // =========================================================

  addToCart(product: Product): void {

    if (!product || !product._id) {
      console.warn('Product ID is missing');
      return;
    }

    if (product.stock <= 0) {
      console.log('Product is out of stock');
      return;
    }

    const cartProduct: CartProduct = {
      _id: product._id,
      productName: product.productName,
      brand: product.brand,
      category: product.category,
      description: product.description,
      image: product.image,
      price: product.discountPrice,
      oldPrice: product.oldPrice,
      discountPrice: product.discountPrice,
      rating: product.rating,
      reviews: product.reviews,
      badge: product.badge,
      color: product.color,
      stock: product.stock,
      quantity: 1
    };

    this.cartService.addToCart(cartProduct);

    // Refresh local cart data.
    this.cart = this.cartService.getCart().map(item => ({
      _id: item._id,
      productName: item.productName,
      brand: item.brand,
      category: item.category,
      description: item.description,
      image: item.image,
      price: item.price,
      oldPrice: item.oldPrice,
      discountPrice: item.discountPrice ?? item.price,
      rating: item.rating ?? 0,
      reviews: item.reviews ?? 0,
      badge: item.badge ?? '',
      color: item.color ?? '',
      stock: item.stock ?? 0,
      isFavourite: item._id
        ? this.wishlistService.isInWishlist(item._id)
        : false,
      quantity: item.quantity ?? 1
    }));

    console.log('PRODUCT ADDED TO CART:', product.productName);
    console.log(
      'TOTAL CART QUANTITY:',
      this.cartService.getCartCount()
    );

    this.cdr.detectChanges();
  }

  // =========================================================
  // GET PRODUCT QUANTITY FROM CART
  // =========================================================

  getCartQuantity(product: Product): number {

    if (!product._id) {
      return 0;
    }

    const cartItem = this.cartService.getCart().find(
      item => String(item._id) === String(product._id)
    );

    return cartItem?.quantity ?? 0;
  }

  // =========================================================
  // INCREASE PRODUCT QUANTITY
  // =========================================================

  increaseProductQuantity(product: Product): void {

    if (!product._id) {
      return;
    }

    const currentQuantity = this.getCartQuantity(product);

    if (currentQuantity < product.stock) {
      this.cartService.increaseQuantity(String(product._id));
      this.cdr.detectChanges();
    }
  }

  // =========================================================
  // DECREASE PRODUCT QUANTITY
  // =========================================================

  decreaseProductQuantity(product: Product): void {

    if (!product._id) {
      return;
    }

    const currentQuantity = this.getCartQuantity(product);

    if (currentQuantity > 1) {
      this.cartService.decreaseQuantity(String(product._id));
      this.cdr.detectChanges();
    }
  }

  // =========================================================
  // REMOVE CART ITEM FROM LOCAL CART
  // =========================================================

  removeFromCart(id: string): void {

    this.cart = this.cart.filter(
      product => product._id !== id
    );
  }

  // =========================================================
  // GET CART COUNT
  // =========================================================

  getCartCount(): number {

    return this.cart.reduce(
      (total, item) => total + (item.quantity || 0),
      0
    );
  }

  // =========================================================
  // TOGGLE WISHLIST
  // =========================================================

  toggleWishlist(product: Product): void {

    if (!product._id) {
      console.warn('Product ID is missing');
      return;
    }

    const isAlreadyInWishlist =
      this.wishlistService.isInWishlist(product._id);

    if (isAlreadyInWishlist) {

      this.wishlistService.removeFromWishlist(
        product._id
      );

    } else {

      this.wishlistService.addToWishlist(
        product as WishlistProduct
      );

    }

    product.isFavourite = !isAlreadyInWishlist;

    console.log(
      'WISHLIST:',
      this.wishlistService.getWishlist?.()
    );

    this.cdr.detectChanges();
  }

  // =========================================================
  // GET WISHLIST COUNT
  // =========================================================

  getWishlistCount(): number {
    return this.wishlist.length;
  }

  // =========================================================
  // CLEAR ALL FILTERS
  // =========================================================

  clearFilters(): void {

    this.searchText = '';
    this.selectedCategory = 'All';
    this.selectedBrand = 'All';
    this.selectedColor = '';
    this.selectedRating = 0;
    this.sortOption = 'popular';
    this.maxPrice = this.maxProductPrice;
    this.currentPage = 1;

    this.applyFilters();
  }

  // =========================================================
  // CALCULATE DISCOUNT PERCENTAGE
  // =========================================================

  calculateDiscount(
    price: number,
    discountPrice: number
  ): number {

    if (
      !price ||
      price <= 0 ||
      discountPrice >= price
    ) {
      return 0;
    }

    return Math.round(
      ((price - discountPrice) / price) * 100
    );
  }

  // =========================================================
  // TRACK BY PRODUCT ID
  // =========================================================

  trackById(
    index: number,
    product: Product
  ): string | number {

    return product._id || index;
  }
}