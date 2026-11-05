
import { CommonModule } from '@angular/common';
import {
  Component,
  OnInit,
  ChangeDetectorRef
} from '@angular/core';
import { HttpClient, HttpClientModule } from '@angular/common/http';
import { ActivatedRoute, Router } from '@angular/router';

import {
  WishlistService,
  WishlistProduct
} from '../../Service/wishlist-product';

import {
  CartProduct,
  CartService
} from '../../Service/cart-product';

interface Product {
  _id?: string;
  productName: string;
  brand: string;
  category: string;
  description: string;
  image: string;
  images: string[];
  price: number;
  oldPrice?: number;
  discountPrice: number;
  rating: number;
  reviews: number;
  badge?: string;
  color: string;
  stock: number;
  isFavourite: boolean;
}

@Component({
  selector: 'app-detailed-product',
  imports: [ CommonModule,
    HttpClientModule],
  templateUrl: './detailed-product.html',
  styleUrl: './detailed-product.css',
})
export class DetailedProduct {
    private apiUrl =
    'https://nirustore-mean-1.onrender.com/Admin/AdminProducts';

  products: Product[] = [];
  product: Product | null = null;

  selectedImage = '';
  quantity = 1;
  loading = true;
  errorMessage = '';

  constructor(
    private http: HttpClient,
    private route: ActivatedRoute,
    private router: Router,
    private cdr: ChangeDetectorRef,
    private wishlistService: WishlistService,
    private cartService: CartService
  ) {}

  ngOnInit(): void {
    this.route.paramMap.subscribe(params => {
      const id = params.get('id');

      if (id) {
        this.loadProducts(id);
      } else {
        this.loading = false;
        this.errorMessage = 'Product ID is missing.';
      }
    });

    this.cartService.cart$.subscribe(() => {
      this.syncQuantity();
      this.cdr.detectChanges();
    });

    this.wishlistService.wishlist$.subscribe(() => {
      if (this.product?._id) {
        this.product.isFavourite =
          this.wishlistService.isInWishlist(this.product._id);
      }

      this.cdr.detectChanges();
    });
  }

  // LOAD PRODUCT DATA
  loadProducts(productId: string): void {
    this.loading = true;
    this.errorMessage = '';

    this.http.get<any>(this.apiUrl).subscribe({
      next: response => {
        const data = Array.isArray(response)
          ? response
          : Array.isArray(response?.products)
            ? response.products
            : [];

        this.products = data.map(
          (item: any) => this.mapProduct(item)
        );

        this.product =
          this.products.find(
            item => String(item._id) === String(productId)
          ) ?? null;

        if (this.product) {
          this.selectedImage =
            this.product.images[0] || this.product.image;

          this.syncQuantity();
        } else {
          this.errorMessage = 'This product could not be found.';
        }

        this.loading = false;
        this.cdr.detectChanges();
      },
      error: error => {
        console.error('PRODUCT DETAILS ERROR:', error);
        this.loading = false;
        this.errorMessage =
          'Unable to load this product. Please try again.';
        this.cdr.detectChanges();
      }
    });
  }

  // NORMALIZE A PRODUCT FROM THE BACKEND

mapProduct(item: any): Product {
  const price = Number(item.price) || 0;
  const discount = Number(item.discount) || 0;

  let discountPrice = Number(item.discountPrice);

  if (!Number.isFinite(discountPrice) || discountPrice <= 0) {
    discountPrice =
      discount > 0 && discount < 100
        ? price - (price * discount / 100)
        : price;
  }

  // MAIN PRODUCT IMAGE
  const image =
    typeof item.image === 'string' && item.image.trim()
      ? item.image.trim()
      : 'assets/products/default.jpg';

  // GET EXTRA IMAGES FROM BOTH POSSIBLE BACKEND FIELDS
  const rawExtraImages = [
    ...(Array.isArray(item.images) ? item.images : []),
    ...(Array.isArray(item.subImages) ? item.subImages : [])
  ];

  // SUPPORT STRING URLS AND COMMON IMAGE OBJECT FORMATS
  const extraImages = rawExtraImages
    .map((img: any) => {
      if (typeof img === 'string') {
        return img.trim();
      }

      if (img && typeof img === 'object') {
        return (
          img.url ||
          img.image ||
          img.imageUrl ||
          img.src ||
          ''
        ).toString().trim();
      }

      return '';
    })
    .filter((img: string) => img.length > 0);

  // MAIN IMAGE FIRST, FOLLOWED BY ALL UNIQUE PREVIEW IMAGES
  const images = Array.from(
    new Set([image, ...extraImages])
  );

  const id = item._id ? String(item._id) : undefined;

  return {
    _id: id,
    productName: item.productName || item.name || 'Product',
    brand: item.brand || 'Unknown Brand',
    category: item.category || 'Other',
    description: item.description || '',
    image,
    images,
    price,
    oldPrice:
      Number(item.oldPrice) > 0
        ? Number(item.oldPrice)
        : undefined,
    discountPrice,
    rating: Number(item.rating) || 0,
    reviews: Number(item.reviews) || 0,
    badge: item.badge || '',
    color: item.color || '',
    stock: Math.max(0, Number(item.stock) || 0),
    isFavourite: id
      ? this.wishlistService.isInWishlist(id)
      : false
  };
}


onThumbnailError(event: Event, image: string): void {
  const img = event.target as HTMLImageElement;

  console.error('Failed to load product thumbnail:', image);

  img.style.visibility = 'hidden';
}



  // IMAGE GALLERY
  selectImage(image: string): void {
    this.selectedImage = image;
  }

  // SUGGESTED PRODUCTS: SAME CATEGORY FIRST
  get suggestedProducts(): Product[] {
    if (!this.product) {
      return [];
    }

    const currentId = String(this.product._id);
    const category = this.product.category.trim().toLowerCase();

    const related = this.products.filter(item =>
      String(item._id) !== currentId &&
      item.category.trim().toLowerCase() === category
    );

    const others = this.products.filter(item =>
      String(item._id) !== currentId &&
      !related.some(relatedItem => relatedItem._id === item._id)
    );

    return [...related, ...others].slice(0, 4);
  }

  // OPEN ANOTHER PRODUCT
  openProduct(product: Product): void {
    if (!product._id) {
      return;
    }

    this.router.navigate(['/ProductDetails', product._id]);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  // WISHLIST
  toggleWishlist(): void {
    if (!this.product?._id) {
      return;
    }

    const id = this.product._id;
    const exists = this.wishlistService.isInWishlist(id);

    if (exists) {
      this.wishlistService.removeFromWishlist(id);
    } else {
      this.wishlistService.addToWishlist(
        this.product as WishlistProduct
      );
    }

    this.product.isFavourite = !exists;
    this.cdr.detectChanges();
  }

  // CURRENT CART QUANTITY
  getCartQuantity(): number {
    if (!this.product?._id) {
      return 0;
    }

    const item = this.cartService.getCart().find(
      cartItem => String(cartItem._id) === String(this.product!._id)
    );

    return item?.quantity ?? 0;
  }

  syncQuantity(): void {
    if (!this.product) {
      return;
    }

    this.quantity = Math.max(1, this.getCartQuantity() || 1);
  }

  // ADD TO CART
  addToCart(): void {
    if (!this.product?._id || this.product.stock <= 0) {
      return;
    }

    const cartProduct: CartProduct = {
      _id: this.product._id,
      productName: this.product.productName,
      brand: this.product.brand,
      category: this.product.category,
      description: this.product.description,
      image: this.product.image,
      price: this.product.discountPrice,
      oldPrice: this.product.oldPrice,
      discountPrice: this.product.discountPrice,
      rating: this.product.rating,
      reviews: this.product.reviews,
      badge: this.product.badge,
      color: this.product.color,
      stock: this.product.stock,
      quantity: 1
    };

    this.cartService.addToCart(cartProduct);
    this.syncQuantity();
    this.cdr.detectChanges();
  }

  // INCREASE CART QUANTITY
  increaseQuantity(): void {
    if (!this.product?._id) {
      return;
    }

    const current = this.getCartQuantity();

    if (current > 0 && current < this.product.stock) {
      this.cartService.increaseQuantity(this.product._id);
      this.syncQuantity();
      this.cdr.detectChanges();
    }
  }

  // DECREASE CART QUANTITY
  decreaseQuantity(): void {
    if (!this.product?._id) {
      return;
    }

    const current = this.getCartQuantity();

    if (current > 1) {
      this.cartService.decreaseQuantity(this.product._id);
      this.syncQuantity();
      this.cdr.detectChanges();
    }
  }

  // DISCOUNT PERCENTAGE
  calculateDiscount(): number {
    if (
      !this.product ||
      this.product.price <= 0 ||
      this.product.discountPrice >= this.product.price
    ) {
      return 0;
    }

    return Math.round(
      ((this.product.price - this.product.discountPrice) /
        this.product.price) * 100
    );
  }

  // STAR DISPLAY
  get stars(): number[] {
    return [1, 2, 3, 4, 5];
  }

  goBack(): void {
    this.router.navigate(['/Shop']);
  }
}
