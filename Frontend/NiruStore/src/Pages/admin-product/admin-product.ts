
import { CommonModule } from '@angular/common';
import {
  ChangeDetectorRef,
  Component,
  OnInit
} from '@angular/core';

import {
  FormBuilder,
  FormGroup,
  FormsModule,
  ReactiveFormsModule,
  Validators
} from '@angular/forms';

import {
  HttpClient,
  HttpErrorResponse
} from '@angular/common/http';

interface Product {
  _id?: string;
  brand: string;
  productName: string;
  category: string;
  price: number;
  discount: number;
  discountedPrice: number;
  stock: number;
  status: 'Active' | 'Inactive';
  description: string;
  image: string;
  subImages: string[];
}

interface ProductApiResponse {
  status?: string;
  success?: boolean;
  message?: string;
  products?: Product[];
  product?: Product;
}

@Component({
  selector: 'app-admin-product',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule
  ],
  templateUrl: './admin-product.html',
  styleUrl: './admin-product.css'
})
export class AdminProduct implements OnInit {

  // =====================================================
  // API CONFIGURATION
  // =====================================================

  private readonly apiUrl =
    'https://nirustore-mean-1.onrender.com/Admin/AdminProducts';

  // =====================================================
  // FORM AND PRODUCT DATA
  // =====================================================

  productForm!: FormGroup;

  products: Product[] = [];

  filteredProducts: Product[] = [];

  editingProduct: Product | null = null;

  editingProductId: string | null = null;

  isEditing = false;

  showProductModal = false;

  loading = false;

  productsLoading = false;

  errorMessage = '';

  successMessage = '';

  selectedImage = '';

  selectedSubImages: string[] = [];

  // =====================================================
  // SEARCH AND FILTERS
  // =====================================================

  searchText = '';

  selectedCategory = '';

  selectedStatus = '';

  categories: string[] = [
    'Watch',
    'Shoes',
    'Perfume',
    'MenClothing',
    'WomenClothing',
    'Accessories'
  ];

  // This array is used directly by your HTML template.
  subImages: string[] = [];

  constructor(
    private fb: FormBuilder,
    private http: HttpClient,
    private cdr: ChangeDetectorRef
  ) {}

  // =====================================================
  // INITIALIZATION
  // =====================================================

  ngOnInit(): void {
    this.initializeForm();
    this.getProducts();
  }

  // =====================================================
  // INITIALIZE REACTIVE FORM
  // =====================================================

  private initializeForm(): void {
    this.productForm = this.fb.group({
      brand: [
        '',
        Validators.required
      ],

      productName: [
        '',
        Validators.required
      ],

      category: [
        '',
        Validators.required
      ],

      price: [
        '',
        [
          Validators.required,
          Validators.min(0)
        ]
      ],

      discount: [
        0,
        [
          Validators.min(0),
          Validators.max(100)
        ]
      ],

      stock: [
        0,
        [
          Validators.required,
          Validators.min(0)
        ]
      ],

      status: [
        'Active',
        Validators.required
      ],

      image: [
        '',
        Validators.required
      ],

      subImages: [[]],

      description: [
        '',
        Validators.required
      ]
    });
  }

  // =====================================================
  // GET ALL PRODUCTS
  // =====================================================

  getProducts(): void {
    this.productsLoading = true;

    this.http.get<ProductApiResponse | Product[]>(
      this.apiUrl
    ).subscribe({
      next: (response) => {
        if (Array.isArray(response)) {
          this.products = response;
        } else {
          this.products = response.products ?? [];
        }

        this.applyFilters();

        this.productsLoading = false;
        this.cdr.detectChanges();
      },

      error: (error: HttpErrorResponse) => {
        console.error(
          'GET PRODUCTS STATUS:',
          error.status
        );

        console.error(
          'GET PRODUCTS RESPONSE:',
          error.error
        );

        this.errorMessage =
          error.error?.message ||
          'Unable to load products. Please check your backend server.';

        this.productsLoading = false;
        this.cdr.detectChanges();
      }
    });
  }

  // =====================================================
  // SEARCH, CATEGORY AND STATUS FILTERS
  // =====================================================

  applyFilters(): void {
    const search = this.searchText
      .trim()
      .toLowerCase();

    this.filteredProducts = this.products.filter(
      (product) => {
        const matchesSearch =
          !search ||
          (product.productName || '')
            .toLowerCase()
            .includes(search) ||
          (product.brand || '')
            .toLowerCase()
            .includes(search) ||
          (product.category || '')
            .toLowerCase()
            .includes(search);

        const matchesCategory =
          !this.selectedCategory ||
          product.category === this.selectedCategory;

        const matchesStatus =
          !this.selectedStatus ||
          product.status === this.selectedStatus;

        return (
          matchesSearch &&
          matchesCategory &&
          matchesStatus
        );
      }
    );

    this.cdr.detectChanges();
  }

  // =====================================================
  // OPEN ADD PRODUCT MODAL
  // =====================================================

  openAddProduct(): void {
    this.resetForm();

    this.errorMessage = '';
    this.successMessage = '';

    this.editingProduct = null;
    this.editingProductId = null;
    this.isEditing = false;

    this.showProductModal = true;
  }

  // =====================================================
  // CLOSE PRODUCT MODAL
  // =====================================================

  closeProductModal(): void {
    this.showProductModal = false;

    this.resetForm();

    this.errorMessage = '';
  }

  // =====================================================
  // MAIN IMAGE HELPER
  // =====================================================

  setMainImage(imageUrl: string): void {
    const cleanUrl = imageUrl.trim();

    this.productForm.patchValue({
      image: cleanUrl
    });

    this.selectedImage = cleanUrl;
  }

  // =====================================================
  // HANDLE BROKEN PRODUCT IMAGES
  // =====================================================

  imageError(event: Event): void {
    const imageElement =
      event.target as HTMLImageElement;

    imageElement.onerror = null;

    imageElement.src =
      'data:image/svg+xml;charset=UTF-8,' +
      encodeURIComponent(`
        <svg xmlns="http://www.w3.org/2000/svg"
             width="400"
             height="400"
             viewBox="0 0 400 400">
          <rect width="400" height="400" fill="#f3f4f6"/>
          <text x="200"
                y="190"
                text-anchor="middle"
                font-size="20"
                fill="#9ca3af">
            Image unavailable
          </text>
          <text x="200"
                y="225"
                text-anchor="middle"
                font-size="14"
                fill="#9ca3af">
            Check image URL
          </text>
        </svg>
      `);
  }

  // =====================================================
  // SUB IMAGE MANAGEMENT
  // =====================================================

  setSubImages(imageUrls: string[]): void {
    this.subImages = imageUrls
      .map((url) => url.trim())
      .filter((url) => url.length > 0)
      .slice(0, 5);

    this.syncSubImages();
  }

  addSubImage(): void {
    if (this.subImages.length >= 5) {
      return;
    }

    this.subImages.push('');

    this.syncSubImages();
  }

  updateSubImage(
    index: number,
    value: string
  ): void {
    if (
      index < 0 ||
      index >= this.subImages.length
    ) {
      return;
    }

    this.subImages[index] = value;

    this.syncSubImages();
  }

  removeSubImage(index: number): void {
    if (
      index < 0 ||
      index >= this.subImages.length
    ) {
      return;
    }

    this.subImages.splice(index, 1);

    this.syncSubImages();
  }

  private syncSubImages(): void {
    this.selectedSubImages = [
      ...this.subImages
    ];

    this.productForm.patchValue({
      subImages: [...this.subImages]
    });
  }

  // =====================================================
  // CONVERT VALUES TO NUMBERS
  // =====================================================

  toNumber(value: unknown): number {
    const numberValue = Number(value);

    return Number.isFinite(numberValue)
      ? numberValue
      : 0;
  }

  // =====================================================
  // CALCULATE DISCOUNTED PRICE
  // =====================================================

  getCurrentDiscountedPrice(): number {
    const price = this.toNumber(
      this.productForm.get('price')?.value
    );

    const discount = this.toNumber(
      this.productForm.get('discount')?.value
    );

    if (
      price < 0 ||
      discount < 0 ||
      discount > 100
    ) {
      return 0;
    }

    return Number(
      (
        price -
        (price * discount) / 100
      ).toFixed(2)
    );
  }

  calculateDiscountedPrice(): number {
    return this.getCurrentDiscountedPrice();
  }

  // =====================================================
  // ADD OR UPDATE PRODUCT
  // =====================================================

 saveProduct(): void {
  this.errorMessage = '';
  this.successMessage = '';

  // ============================================
  // 1. VALIDATE THE FORM
  // ============================================

  if (this.productForm.invalid) {
    this.productForm.markAllAsTouched();

    this.errorMessage =
      'Please fill in all required product fields.';

    return;
  }

  // Prevent duplicate submissions
  if (this.loading) {
    return;
  }

  // ============================================
  // 2. GET FORM VALUES
  // ============================================

  const formValue = this.productForm.getRawValue();

  const brand = String(
    formValue.brand ?? ''
  ).trim();

  const productName = String(
    formValue.productName ?? ''
  ).trim();

  const category = String(
    formValue.category ?? ''
  ).trim();

  const price = this.toNumber(
    formValue.price
  );

  const discount = this.toNumber(
    formValue.discount
  );

  const stock = this.toNumber(
    formValue.stock
  );

  const image = String(
    formValue.image ?? ''
  ).trim();

  const description = String(
    formValue.description ?? ''
  ).trim();

  // ============================================
  // 3. REQUIRED FIELD VALIDATION
  // ============================================

  if (
    !brand ||
    !productName ||
    !category ||
    !image ||
    !description
  ) {
    this.errorMessage =
      'Please complete all required fields.';

    return;
  }

  // ============================================
  // 4. PRICE, DISCOUNT AND STOCK VALIDATION
  // ============================================

  if (
    !Number.isFinite(price) ||
    !Number.isFinite(discount) ||
    !Number.isFinite(stock) ||
    price < 0 ||
    discount < 0 ||
    discount > 100 ||
    stock < 0
  ) {
    this.errorMessage =
      'Enter valid price, discount, and stock values.';

    return;
  }

  // ============================================
  // 5. CLEAN ADDITIONAL PRODUCT IMAGES
  // ============================================

  // Read the URLs from the sub-images array.
  // Remove empty values and extra spaces.
  // Store a maximum of 5 additional images.

  const cleanSubImages: string[] = (
    Array.isArray(this.subImages)
      ? this.subImages
      : []
  )
    .map((url: string) =>
      String(url ?? '').trim()
    )
    .filter((url: string) =>
      url.length > 0
    )
    .slice(0, 5);

  // ============================================
  // 6. CALCULATE DISCOUNTED PRICE
  // ============================================

  const discountedPrice = Number(
    (
      price -
      (price * discount) / 100
    ).toFixed(2)
  );

  // ============================================
  // 7. PREPARE COMPLETE PRODUCT DATA
  // ============================================

  const productData: Product = {
    brand,
    productName,
    category,
    price,
    discount,
    discountedPrice,
    stock,

    status: formValue.status as
      | 'Active'
      | 'Inactive',

    description,
    image,

    // Important: include additional images
    // in the request sent to the backend.
    subImages: cleanSubImages
  };

  // ============================================
  // 8. CHECK ADD OR UPDATE OPERATION
  // ============================================

  const updating =
    this.isEditing &&
    !!this.editingProductId;

  // ============================================
  // 9. DEBUGGING LOGS
  // ============================================

  console.log(
    '===================================='
  );

  console.log(
    updating
      ? 'UPDATING PRODUCT'
      : 'ADDING NEW PRODUCT'
  );

  console.log(
    'PRODUCT NAME:',
    productData.productName
  );

  console.log(
    'MAIN PRODUCT IMAGE:',
    productData.image
  );

  console.log(
    'ADDITIONAL PRODUCT IMAGES:',
    productData.subImages
  );

  console.log(
    'ADDITIONAL IMAGE COUNT:',
    productData.subImages.length
  );

  console.log(
    'COMPLETE PRODUCT PAYLOAD:',
    JSON.stringify(productData, null, 2)
  );

  console.log(
    '===================================='
  );

  // ============================================
  // 10. SHOW LOADING STATE
  // ============================================

  this.loading = true;

  // ============================================
  // 11. SEND POST OR PUT REQUEST
  // ============================================

  const request$ = updating
    ? this.http.put<ProductApiResponse>(
        `${this.apiUrl}/${this.editingProductId}`,
        productData
      )
    : this.http.post<ProductApiResponse>(
        this.apiUrl,
        productData
      );

  // ============================================
  // 12. HANDLE API RESPONSE
  // ============================================

  request$.subscribe({
    next: (response) => {
      console.log(
        'PRODUCT SAVE RESPONSE:',
        response
      );

      console.log(
        'SAVED PRODUCT FROM BACKEND:',
        response.product
      );

      console.log(
        'SAVED ADDITIONAL IMAGES:',
        response.product?.subImages
      );

      this.loading = false;

      this.successMessage =
        response.message ||
        (
          updating
            ? 'Product updated successfully.'
            : 'Product added successfully.'
        );

      // Close the product modal
      this.showProductModal = false;

      // Reset the form and image arrays
      this.resetForm();

      // Reload products from the backend
      this.getProducts();

      this.cdr.detectChanges();
    },

    // ==========================================
    // 13. HANDLE API ERRORS
    // ==========================================

    error: (error: HttpErrorResponse) => {
      console.error(
        'PRODUCT SAVE HTTP STATUS:',
        error.status
      );

      console.error(
        'PRODUCT SAVE BACKEND RESPONSE:',
        error.error
      );

      console.error(
        'PRODUCT SAVE ERROR MESSAGE:',
        error.message
      );

      this.loading = false;

      this.errorMessage =
        error.error?.message ||
        error.error?.error ||
        (
          error.status === 500
            ? 'Backend error while saving the product. Check the Express terminal.'
            : 'Unable to save the product. Please try again.'
        );

      this.cdr.detectChanges();
    }
  });
}

  // =====================================================
  // EDIT PRODUCT
  // =====================================================

  editProduct(product: Product): void {
    if (!product._id) {
      this.errorMessage =
        'Cannot edit this product because its ID is missing.';

      return;
    }

    this.errorMessage = '';
    this.successMessage = '';

    this.editingProduct = product;
    this.editingProductId = product._id;
    this.isEditing = true;

    this.selectedImage = product.image || '';

    this.subImages = [
      ...(product.subImages || [])
    ];

    this.selectedSubImages = [
      ...this.subImages
    ];

    this.productForm.patchValue({
      brand: product.brand || '',
      productName: product.productName || '',
      category: product.category || '',
      price: product.price ?? 0,
      discount: product.discount ?? 0,
      stock: product.stock ?? 0,
      status: product.status || 'Active',
      image: product.image || '',
      subImages: [...this.subImages],
      description: product.description || ''
    });

    this.productForm.markAsPristine();
    this.productForm.markAsUntouched();

    this.showProductModal = true;

    this.cdr.detectChanges();
  }

  // =====================================================
  // DELETE PRODUCT
  // Matches your HTML: deleteProduct(product._id!)
  // =====================================================

  deleteProduct(productId: string): void {
    if (!productId) {
      this.errorMessage =
        'Cannot delete this product because its ID is missing.';

      return;
    }

    const product = this.products.find(
      (item) => item._id === productId
    );

    const productName =
      product?.productName || 'this product';

    const confirmed = window.confirm(
      `Are you sure you want to delete "${productName}"?`
    );

    if (!confirmed) {
      return;
    }

    this.errorMessage = '';
    this.successMessage = '';

    this.http.delete<ProductApiResponse>(
      `${this.apiUrl}/${productId}`
    ).subscribe({
      next: (response) => {
        this.successMessage =
          response.message ||
          'Product deleted successfully.';

        this.products = this.products.filter(
          (item) => item._id !== productId
        );

        this.applyFilters();

        this.cdr.detectChanges();
      },

      error: (error: HttpErrorResponse) => {
        console.error(
          'DELETE PRODUCT STATUS:',
          error.status
        );

        console.error(
          'DELETE PRODUCT RESPONSE:',
          error.error
        );

        this.errorMessage =
          error.error?.message ||
          'Unable to delete the product.';

        this.cdr.detectChanges();
      }
    });
  }

  // =====================================================
  // RESET FORM
  // =====================================================

  resetForm(): void {
    this.isEditing = false;

    this.editingProduct = null;

    this.editingProductId = null;

    this.selectedImage = '';

    this.subImages = [];

    this.selectedSubImages = [];

    this.productForm.reset({
      brand: '',
      productName: '',
      category: '',
      price: '',
      discount: 0,
      stock: 0,
      status: 'Active',
      image: '',
      subImages: [],
      description: ''
    });

    this.productForm.markAsPristine();
    this.productForm.markAsUntouched();

    this.cdr.detectChanges();
  }

  // =====================================================
  // FORM VALIDATION HELPER
  // =====================================================

  hasError(controlName: string): boolean {
    const control =
      this.productForm.get(controlName);

    return !!(
      control &&
      control.invalid &&
      (
        control.touched ||
        control.dirty
      )
    );
  }
}
