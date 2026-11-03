import { CommonModule } from '@angular/common';

import {
  ChangeDetectorRef,
  Component,
  OnDestroy,
  OnInit
} from '@angular/core';

import {
  HttpClient,
  HttpClientModule
} from '@angular/common/http';

import { RouterLink } from '@angular/router';

import { Subscription } from 'rxjs';

import {
  HomeContent,
  HeroSlide,
  Collection
} from '../../Service/home-content';

import { LoaderSer } from '../../Service/loaderser';

@Component({
  selector: 'app-landing-page',
  standalone: true,

  imports: [
    CommonModule,
    RouterLink,
    HttpClientModule
  ],

  templateUrl: './landing-page.html',
  styleUrl: './landing-page.css'
})
export class LandingPage implements OnInit, OnDestroy {

  // =========================================================
  // CURRENT SLIDE
  // =========================================================

  currentSlide = 0;

  // =========================================================
  // LOADING AND ERROR
  // =========================================================

  isLoading = true;
  loadError = '';

  // =========================================================
  // HERO SLIDES
  // =========================================================

  heroSlides: HeroSlide[] = [];

  // =========================================================
  // COLLECTIONS
  // =========================================================

  collections: Collection[] = [];
  filteredCollections: Collection[] = [];

  // =========================================================
  // API URLS
  // =========================================================

  private readonly productsApiUrl =
    'http://localhost:8040/Admin/AdminProducts';

  // =========================================================
  // TIMER AND SUBSCRIPTIONS
  // =========================================================

  private slideTimer: ReturnType<typeof setInterval> | null = null;

  private contentSubscription?: Subscription;
  private productsSubscription?: Subscription;

  // Prevent an image from decrementing the counter twice.
  private loadedImages = new WeakSet<HTMLImageElement>();

  // =========================================================
  // CONSTRUCTOR
  // =========================================================

  constructor(
    private homeContentService: HomeContent,
    private http: HttpClient,
    private cdr: ChangeDetectorRef,
    private loaderService: LoaderSer
  ) {}

  // =========================================================
  // INITIALIZATION
  // =========================================================

  ngOnInit(): void {
    this.loadHomeContent();
  }

  // =========================================================
  // LOAD HOME PAGE CONTENT
  // =========================================================

  loadHomeContent(): void {

    // Start the universal loader.
    this.loaderService.startPage();

    // Reset any previous image count when retrying.
    this.loaderService.startImages(0);

    this.isLoading = true;
    this.loadError = '';

    this.contentSubscription?.unsubscribe();
    this.productsSubscription?.unsubscribe();

    this.contentSubscription =
      this.homeContentService.getHomeContent().subscribe({

        next: (response: any) => {

          if (!response || !response.success) {

            this.loadError =
              'Unable to load home page content.';

            this.isLoading = false;

            this.loaderService.startImages(0);
            this.loaderService.finishPage();

            this.cdr.detectChanges();

            return;
          }

          // Load hero slides from the backend.

          this.heroSlides =
            response.heroSlides || [];

          // Load collections from the backend.

          this.collections =
            (response.collections || []).map(
              (item: Collection) => ({ ...item })
            );

          // Initially show the collections from the backend.

          this.filteredCollections = [
            ...this.collections
          ];

          // Load products and calculate collection counts.
          // The page loader remains active until this finishes.

          this.loadCollectionProductCounts();

          // Reset and start the hero slider.

          this.currentSlide = 0;

          this.stopAutoSlide();

          if (this.heroSlides.length > 1) {
            this.startAutoSlide();
          }

          console.log(
            'HOME COLLECTIONS:',
            this.collections
          );
        },

        error: (error: unknown) => {

          console.error(
            'HOME CONTENT API ERROR:',
            error
          );

          this.loadError =
            'Unable to load collections. Please check the backend server.';

          this.isLoading = false;

          this.loaderService.startImages(0);
          this.loaderService.finishPage();

          this.cdr.detectChanges();
        }
      });
  }

  // =========================================================
  // LOAD PRODUCTS AND CALCULATE COLLECTION COUNTS
  // =========================================================

  loadCollectionProductCounts(): void {

    this.productsSubscription?.unsubscribe();

    this.productsSubscription =
      this.http.get<any>(this.productsApiUrl).subscribe({

        next: (response: any) => {

          console.log(
            'ADMIN PRODUCTS API RESPONSE:',
            response
          );

          // Support these API response formats:
          // 1. [...]
          // 2. { products: [...] }
          // 3. { data: [...] }

          let products: any[] = [];

          if (Array.isArray(response)) {

            products = response;

          } else if (Array.isArray(response?.products)) {

            products = response.products;

          } else if (Array.isArray(response?.data)) {

            products = response.data;

          } else {

            console.error(
              'Products array not found in API response.',
              response
            );

            this.loadError =
              'Unable to calculate collection counts. Check the Admin Products API response.';

            this.isLoading = false;

            this.loaderService.startImages(0);
            this.loaderService.finishPage();

            this.cdr.detectChanges();

            return;
          }

          // Recalculate each collection using actual products.

          this.collections = this.collections.map(
            (collection: Collection) => {

              const collectionCategory =
                this.normalizeCategory(
                  collection.categoryKey || collection.name
                );

              const count = products.filter(
                (product: any) => {

                  const productCategory =
                    this.normalizeCategory(
                      product.category || ''
                    );

                  return (
                    productCategory === collectionCategory
                  );
                }
              ).length;

              const updatedCollection: Collection = {
                ...collection,
                items: count
              };

              console.log(
                `COLLECTION: ${collection.name}`,
                `CATEGORY: ${collectionCategory}`,
                `COUNT: ${count}`
              );

              return updatedCollection;
            }
          );

          // Update displayed collection cards.

          this.filteredCollections = [
            ...this.collections
          ];

          // =================================================
          // REGISTER IMAGE COUNT BEFORE RENDERING IMAGES
          // =================================================

          const totalImages =
            this.heroSlides.length +
            this.filteredCollections.length;

          this.loaderService.startImages(totalImages);

          // Allow the hero and collection images to render.

          this.isLoading = false;

          this.loaderService.finishPage();

          this.cdr.detectChanges();

          console.log(
            'TOTAL IMAGES TO LOAD:',
            totalImages
          );

          console.log(
            'UPDATED COLLECTION COUNTS:',
            this.filteredCollections
          );
        },

        error: (error: unknown) => {

          console.error(
            'PRODUCT COUNT API ERROR:',
            error
          );

          this.loadError =
            'Unable to load product counts. Please check that the Admin Products API is running.';

          this.isLoading = false;

          this.loaderService.startImages(0);
          this.loaderService.finishPage();

          this.cdr.detectChanges();
        }
      });
  }

  // =========================================================
  // NORMALIZE CATEGORY NAMES
  // =========================================================

  normalizeCategory(category: string): string {

    const value = String(category ?? '')
      .trim()
      .toLowerCase()
      .replace(/[_-]+/g, ' ')
      .replace(/\s+/g, ' ');

    const compact = value.replace(/[^a-z0-9]/g, '');

    const categoryMap: Record<string, string> = {

      // MEN FASHION
      menclothing: 'MenClothing',
      mensclothing: 'MenClothing',
      menfashion: 'MenClothing',
      mensfashion: 'MenClothing',

      // WOMEN FASHION
      womenclothing: 'WomenClothing',
      womensclothing: 'WomenClothing',
      womenfashion: 'WomenClothing',
      womensfashion: 'WomenClothing',

      // GENERAL CLOTHING
      clothing: 'Clothing',
      clothes: 'Clothing',

      // PERFUMES
      perfume: 'Perfume',
      perfumes: 'Perfume',
      fragrance: 'Perfume',
      fragrances: 'Perfume',

      // WATCHES
      watch: 'Watches',
      watches: 'Watches',

      // SHOES
      shoe: 'Shoes',
      shoes: 'Shoes',
      footwear: 'Shoes',

      // BAGS
      bag: 'Bags',
      bags: 'Bags',

      // ACCESSORIES
      accessory: 'Accessories',
      accessories: 'Accessories'
    };

    return categoryMap[compact] || compact;
  }

  // =========================================================
  // HANDLE SUCCESSFUL IMAGE LOAD
  // =========================================================

  onLandingImageLoaded(event: Event): void {

    const image = event.target as HTMLImageElement;

    // Avoid decrementing the same image more than once.

    if (this.loadedImages.has(image)) {
      return;
    }

    this.loadedImages.add(image);

    this.loaderService.imageLoaded();

    console.log(
      'IMAGE LOADED:',
      image.currentSrc || image.src
    );
  }

  // =========================================================
  // COLLECTION IMAGE ERROR / FALLBACK
  // =========================================================

  onCollectionImageError(event: Event): void {

    const image = event.target as HTMLImageElement;

    const fallback =
      'https://placehold.co/800x600/181818/d4af37?text=Collection';

    // If the fallback also fails, finish this image.

    if (image.dataset['fallbackTried'] === 'true') {

      this.onLandingImageLoaded(event);

      return;
    }

    // Try fallback image.

    image.dataset['fallbackTried'] = 'true';

    image.src = fallback;
  }

  // =========================================================
  // START AUTOMATIC SLIDER
  // =========================================================

  startAutoSlide(): void {

    this.stopAutoSlide();

    if (this.heroSlides.length <= 1) {
      return;
    }

    this.slideTimer = setInterval(() => {

      this.currentSlide =
        (this.currentSlide + 1) %
        this.heroSlides.length;

      this.cdr.detectChanges();

    }, 5000);
  }

  // =========================================================
  // STOP AUTOMATIC SLIDER
  // =========================================================

  stopAutoSlide(): void {

    if (this.slideTimer !== null) {

      clearInterval(this.slideTimer);

      this.slideTimer = null;
    }
  }

  // =========================================================
  // MANUAL SLIDE SELECTION
  // =========================================================

  goToSlide(index: number): void {

    if (
      index < 0 ||
      index >= this.heroSlides.length
    ) {
      return;
    }

    this.currentSlide = index;

    this.startAutoSlide();
  }

  // =========================================================
  // COMPONENT DESTROY
  // =========================================================

  ngOnDestroy(): void {

    this.stopAutoSlide();

    this.contentSubscription?.unsubscribe();

    this.productsSubscription?.unsubscribe();

    // Clean up this page's loading state if user navigates away.

    this.loaderService.startImages(0);
    this.loaderService.finishPage();
  }
}