
import { CommonModule } from '@angular/common';

import {
  Component,
  OnInit,
  OnDestroy,
  AfterViewInit,
  ChangeDetectorRef,
  ElementRef,
  ViewChild,
  HostListener
} from '@angular/core';

import { FormsModule } from '@angular/forms';
import { HttpClient, HttpClientModule } from '@angular/common/http';

// =====================================
// INTERFACES
// =====================================

interface Brand {
  _id?: string;
  name: string;
  image: string;
  description?: string;
  status?: string;
}

interface Review {
  _id?: string;
  name: string;
  email?: string;
  brand: string;
  rating: number;
  review: string;
  recommend: boolean;
  createdAt?: string | Date;
}

interface ReviewForm {
  name: string;
  email: string;
  brand: string;
  rating: number;
  review: string;
  recommend: boolean;
}

// =====================================
// COMPONENT
// =====================================

@Component({
  selector: 'app-brands',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    HttpClientModule
  ],
  templateUrl: './brands.html',
  styleUrls: ['./brands.css']
})
export class Brands implements OnInit, AfterViewInit, OnDestroy {

  private readonly brandsApi =
    'https://nirustore-mean-1.onrender.com/api/Brands';

  private readonly reviewsApi =
    'https://nirustore-mean-1.onrender.com/api/Reviews';

  // =====================================
  // CAROUSEL ELEMENTS
  // =====================================

  @ViewChild('carouselViewport')
  carouselViewport?: ElementRef<HTMLDivElement>;

  @ViewChild('carouselTrack')
  carouselTrack?: ElementRef<HTMLDivElement>;

  // =====================================
  // BRANDS
  // =====================================

  brands: Brand[] = [];

  brandsLoading = false;

  brandsError = '';

  fallbackImage = 'assets/brands/default.png';

  // =====================================
  // REVIEWS
  // =====================================

  testimonials: Review[] = [];

  reviewsLoading = false;

  reviewsError = '';

  // =====================================
  // CAROUSEL SETTINGS
  // =====================================

  currentReviewIndex = 0;

  visibleReviews = 3;

  trackOffset = 0;

  readonly carouselGap = 20;

  private positionFrame: number | null = null;

  // =====================================
  // REVIEW FORM
  // =====================================

  reviewForm: ReviewForm = {
    name: '',
    email: '',
    brand: '',
    rating: 5,
    review: '',
    recommend: false
  };

  reviewSubmitting = false;

  reviewSuccess = '';

  reviewSubmitError = '';

  // =====================================
  // CONSTRUCTOR
  // =====================================

  constructor(
    private http: HttpClient,
    private cdr: ChangeDetectorRef
  ) {}

  // =====================================
  // INITIALIZATION
  // =====================================

  ngOnInit(): void {

    this.updateVisibleReviews();

    this.loadBrands();

    this.loadReviews();

  }

  ngAfterViewInit(): void {

    this.updateCarouselPosition();

  }

  ngOnDestroy(): void {

    if (this.positionFrame !== null) {

      cancelAnimationFrame(this.positionFrame);

      this.positionFrame = null;

    }

  }

  // =====================================
  // BRANDS API
  // =====================================

  loadBrands(): void {

    this.brandsLoading = true;

    this.brandsError = '';

    this.http.get<any>(this.brandsApi).subscribe({

      next: (response) => {

        const list: Brand[] = Array.isArray(response)
          ? response
          : response?.brands || response?.data || [];

        this.brands = list

          .filter((brand: Brand) =>
            !brand.status ||
            brand.status.toLowerCase() === 'active'
          )

          .map((brand: Brand) => ({
            ...brand,
            image: this.getImageUrl(brand.image)
          }));

        this.brandsLoading = false;

        this.cdr.detectChanges();

      },

      error: (error) => {

        console.error('BRANDS API ERROR:', error);

        this.brandsError =
          error?.error?.message ||
          'Unable to load brands. Please try again.';

        this.brandsLoading = false;

        this.cdr.detectChanges();

      }

    });

  }

  // =====================================
  // BRAND IMAGE URL
  // =====================================


getImageUrl(image?: string): string {

  if (!image || !image.trim()) {
    return this.fallbackImage;
  }

  const path = image.trim();

  // Fix old localhost image URLs saved in MongoDB
  if (
    path.startsWith('http://localhost:4200/') ||
    path.startsWith('https://localhost:4200/')
  ) {
    return path.replace(
      /^https?:\/\/localhost:4200\//,
      '/'
    );
  }

  // Preserve other complete image URLs
  if (
    path.startsWith('http://') ||
    path.startsWith('https://') ||
    path.startsWith('data:')
  ) {
    return path;
  }

  // Relative image path
  return `/${path.replace(/^\/+/, '')}`;
}

  onBrandImageError(event: Event): void {
  const img = event.target as HTMLImageElement;

  // Prevent the same error handler from running repeatedly.
  img.onerror = null;

  console.error('Brand image could not load:', img.src);

  // Hide the image if even the fallback is unavailable.
  img.style.display = 'none';
}
  // =====================================
  // REVIEWS API
  // =====================================

  loadReviews(): void {

    this.reviewsLoading = true;

    this.reviewsError = '';

    this.http.get<any>(this.reviewsApi).subscribe({

      next: (response) => {
        console.log('Reviews API Response:', response);


        const list: Review[] = Array.isArray(response)
          ? response
          : response?.reviews || response?.data || [];

        this.testimonials = list.map((item: Review) => ({

          ...item,

          rating: Number(item.rating) || 0,

          recommend: Boolean(item.recommend)

        }));

        this.currentReviewIndex = 0;

        this.trackOffset = 0;

        this.reviewsLoading = false;

        this.cdr.detectChanges();

        // Wait until Angular renders all review cards.
        requestAnimationFrame(() => {

          this.updateVisibleReviews();

          this.updateCarouselPosition();

        });

      },

      error: (error) => {

        console.error('REVIEWS API ERROR:', error);

        this.reviewsError =
          error?.error?.message ||
          'Unable to load customer reviews. Please try again.';

        this.reviewsLoading = false;

        this.cdr.detectChanges();

      }

    });

  }

  // =====================================
  // RESPONSIVE CARD COUNT
  // =====================================

  @HostListener('window:resize')
  onWindowResize(): void {

    this.updateVisibleReviews();

    this.updateCarouselPosition();

  }

  updateVisibleReviews(): void {

    if (typeof window === 'undefined') {

      return;

    }

    const width = window.innerWidth;

    if (width < 640) {

      // Mobile: 1 card
      this.visibleReviews = 1;

    } else if (width < 1024) {

      // Tablet: 2 cards
      this.visibleReviews = 2;

    } else {

      // Laptop/Desktop: 3 cards
      this.visibleReviews = 3;

    }

    // Prevent the index from going beyond the last position.
    this.currentReviewIndex = Math.min(
      this.currentReviewIndex,
      this.maxReviewIndex
    );

    this.cdr.detectChanges();

  }

  // =====================================
  // CAROUSEL GETTERS
  // =====================================

  get maxReviewIndex(): number {

    return Math.max(
      0,
      this.testimonials.length - this.visibleReviews
    );

  }

  get showCarouselArrows(): boolean {

    return this.testimonials.length > this.visibleReviews;

  }

  get canGoPrevious(): boolean {

    return this.currentReviewIndex > 0;

  }

  get canGoNext(): boolean {

    return this.currentReviewIndex < this.maxReviewIndex;

  }

  get lastVisibleReview(): number {

    return Math.min(
      this.currentReviewIndex + this.visibleReviews,
      this.testimonials.length
    );

  }

  get reviewDots(): number[] {

    return Array.from(
      { length: this.maxReviewIndex + 1 },
      (_, index) => index
    );

  }

  // =====================================
  // CARD WIDTH
  // =====================================

  getCardFlex(): string {

    const totalGap =
      (this.visibleReviews - 1) * this.carouselGap;

    return `0 0 calc((100% - ${totalGap}px) / ${this.visibleReviews})`;

  }

  // =====================================
  // CAROUSEL POSITION
  // =====================================

  private updateCarouselPosition(): void {

    // Cancel any previous pending calculation.
    if (this.positionFrame !== null) {

      cancelAnimationFrame(this.positionFrame);

      this.positionFrame = null;

    }

    this.positionFrame = requestAnimationFrame(() => {

      const track = this.carouselTrack?.nativeElement;

      if (!track || this.testimonials.length === 0) {

        this.trackOffset = 0;

        this.positionFrame = null;

        this.cdr.detectChanges();

        return;

      }

      const firstSlide =
        track.querySelector<HTMLElement>('.review-slide');

      if (!firstSlide) {

        this.trackOffset = 0;

        this.positionFrame = null;

        this.cdr.detectChanges();

        return;

      }

      const cardWidth =
        firstSlide.getBoundingClientRect().width;

      if (cardWidth <= 0) {

        this.positionFrame = null;

        return;

      }

      // Move one card width plus the gap for every index.
      this.trackOffset =
        this.currentReviewIndex *
        (cardWidth + this.carouselGap);

      this.positionFrame = null;

      this.cdr.detectChanges();

    });

  }

  // =====================================
  // SET REVIEW INDEX
  // =====================================

  private setReviewIndex(index: number): void {

    const safeIndex = Math.max(
      0,
      Math.min(index, this.maxReviewIndex)
    );

    this.currentReviewIndex = safeIndex;

    this.updateCarouselPosition();

  }

  // =====================================
  // NEXT REVIEW
  // =====================================

  nextReview(): void {

    if (!this.canGoNext) {

      return;

    }

    // Move the track left to show the next card.
    this.setReviewIndex(
      this.currentReviewIndex + 1
    );

  }

  // =====================================
  // PREVIOUS REVIEW
  // =====================================

  previousReview(): void {

    if (!this.canGoPrevious) {

      return;

    }

    // Move the track right to show the previous card.
    this.setReviewIndex(
      this.currentReviewIndex - 1
    );

  }

  // =====================================
  // DOT NAVIGATION
  // =====================================

  goToReview(index: number): void {

    this.setReviewIndex(index);

  }

  // =====================================
  // SUBMIT REVIEW
  // =====================================

  submitReview(): void {

    this.reviewSuccess = '';

    this.reviewSubmitError = '';

    if (this.reviewSubmitting) {

      return;

    }

    const name = this.reviewForm.name.trim();

    const email = this.reviewForm.email.trim();

    const brand = this.reviewForm.brand.trim();

    const review = this.reviewForm.review.trim();

    const rating = Number(this.reviewForm.rating);

    if (!name || !email || !brand || !review) {

      this.reviewSubmitError =
        'Please fill in all required fields.';

      return;

    }

    if (name.length < 2) {

      this.reviewSubmitError =
        'Name must contain at least 2 characters.';

      return;

    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {

      this.reviewSubmitError =
        'Please enter a valid email address.';

      return;

    }

    if (review.length < 5) {

      this.reviewSubmitError =
        'Review must contain at least 5 characters.';

      return;

    }

    if (
      !Number.isInteger(rating) ||
      rating < 1 ||
      rating > 5
    ) {

      this.reviewSubmitError =
        'Please select a valid rating.';

      return;

    }

    const reviewData: ReviewForm = {

      name,

      email,

      brand,

      rating,

      review,

      recommend: this.reviewForm.recommend

    };

    this.reviewSubmitting = true;

    this.http.post<any>(
      this.reviewsApi,
      reviewData
    ).subscribe({

      next: (response) => {

        this.reviewSuccess =
          response?.message ||
          'Thank you! Your review has been submitted successfully.';

        this.reviewSubmitting = false;

        this.reviewForm = {

          name: '',

          email: '',

          brand: '',

          rating: 5,

          review: '',

          recommend: false

        };

        // Reload the reviews after successful submission.
        this.loadReviews();

        this.cdr.detectChanges();

      },

      error: (error) => {

        console.error('REVIEW SUBMISSION ERROR:', error);

        this.reviewSubmitError =
          error?.error?.message ||
          'Unable to submit your review. Please try again.';

        this.reviewSubmitting = false;

        this.cdr.detectChanges();

      }

    });

  }

}
