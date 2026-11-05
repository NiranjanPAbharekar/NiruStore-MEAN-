
import { CommonModule } from '@angular/common';
import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { HttpClient, HttpClientModule } from '@angular/common/http';
import { RouterLink } from '@angular/router';

import { Footer } from "../../Components/footer/footer";
import { Navbar } from "../../Components/navbar/navbar";

// =====================================
// INTERFACES
// =====================================

interface Team {
  name: string;
  designation: string;
  image: string;
}

interface Brand {
  _id?: string;
  name: string;
  image?: string;
  logo?: string;
  description?: string;
  status?: string;
}

interface Testimonial {
  name: string;
  designation: string;
  image: string;
  review: string;
  rating: number;
}

interface Timeline {
  year: string;
  title: string;
  description: string;
}

@Component({
  selector: 'app-about-us',
  standalone: true,
  imports: [
    CommonModule,
    RouterLink,
    HttpClientModule,
    Footer,
    Navbar
  ],
  templateUrl: './about-us.html',
  styleUrl: './about-us.css'
})
export class AboutUs implements OnInit {

  private readonly brandsApi =
    'https://nirustore-mean-1.onrender.com/api/Brands';

  constructor(
    private http: HttpClient,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.loadBrands();
  }

  // =====================================
  // COMPANY STATS
  // =====================================

  stats = {
    products: 1200,
    customers: 15000,
    brands: 50,
    awards: 12
  };

  // =====================================
  // TEAM MEMBERS
  // =====================================

team = [
  {
    name: 'Niranjan Pabharekar',
    designation: 'Founder & CEO',
    image: '/Team/Niranjan.jpeg'
  },
  {
    name: 'Rahul Sharma',
    designation: 'Marketing Head',
    image: '/Team/Rahul.jpeg'
  },
  {
    name: 'Priya Mehta',
    designation: 'Fashion Expert',
    image: '/Team/Priya.jpeg'
  },
  {
    name: 'Amit Verma',
    designation: 'Customer Success',
    image: '/Team/Amit.jpeg'
  }
];
onTeamImageError(event: Event, member: Team): void {
  const img = event.target as HTMLImageElement;

  console.error('Team image failed:', {
    name: member.name,
    imagePath: member.image,
    actualURL: img.src
  });
} 
  // =====================================
  // BRAND PARTNERS - API DATA
  // =====================================

  brands: Brand[] = [];

  brandsLoading = false;

  brandsError = '';

  fallbackImage = 'assets/brands/default.png';


loadBrands(): void {

  this.brandsLoading = true;
  this.brandsError = '';

  this.http.get<any>(this.brandsApi).subscribe({

    next: (response) => {

      console.log('COMPLETE BRANDS API RESPONSE:', response);

      const list: Brand[] = Array.isArray(response)
        ? response
        : Array.isArray(response?.brands)
          ? response.brands
          : Array.isArray(response?.data)
            ? response.data
            : [];

      this.brands = list

        .filter((brand: Brand) =>
          !brand.status ||
          brand.status.toLowerCase() === 'active'
        )

        .map((brand: Brand) => {

          const originalImage = brand.image || brand.logo;

          const finalImage = this.getImageUrl(originalImage);

          console.log('BRAND IMAGE CHECK:', {
            name: brand.name,
            originalImage: originalImage,
            finalImage: finalImage
          });

          return {
            ...brand,
            image: finalImage
          };

        });

      console.log('FINAL BRANDS:', this.brands);

      this.brandsLoading = false;

      this.cdr.detectChanges();

    },

    error: (error) => {

      console.error('BRANDS API ERROR:', error);

      this.brandsError =
        error?.error?.message ||
        'Unable to load brand partners.';

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

  // Already a complete image URL
  if (
    path.startsWith('http://') ||
    path.startsWith('https://') ||
    path.startsWith('data:')
  ) {
    return path;
  }

  // Relative image path - works locally and on Netlify
  return `/${path.replace(/^\/+/, '')}`;

}



  // =====================================
  // BRAND IMAGE ERROR
  // =====================================

 
onBrandImageError(event: Event): void {
  const img = event.target as HTMLImageElement;

  // Stop the error handler from running again.
  img.onerror = null;

  console.error('BRAND IMAGE FAILED:', img.src);

  // Hide the broken image instead of loading another missing image.
  img.style.display = 'none';
}

  // =====================================
  // TESTIMONIALS
  // =====================================

  testimonials: Testimonial[] = [
    {
      name: 'Ankit Sharma',
      designation: 'Verified Buyer',
      image: 'assets/about/customer1.jpg',
      review:
        'Amazing premium quality products. Fast delivery and excellent customer support. Highly recommended.',
      rating: 5
    },
    {
      name: 'Sneha Patel',
      designation: 'Fashion Blogger',
      image: 'assets/about/customer2.jpg',
      review:
        'One of the best luxury shopping experiences I have ever had. Beautiful packaging and genuine products.',
      rating: 5
    },
    {
      name: 'Rohit Singh',
      designation: 'Business Owner',
      image: 'assets/about/customer3.jpg',
      review:
        'Great prices, original brands and quick delivery. Will definitely purchase again.',
      rating: 5
    }
  ];

  // =====================================
  // COMPANY TIMELINE
  // =====================================

  timeline: Timeline[] = [
    {
      year: '2018',
      title: 'Company Started',
      description:
        'NiruStore was founded with the vision of delivering premium luxury products.'
    },
    {
      year: '2019',
      title: '10K Customers',
      description:
        'Successfully served more than 10,000 happy customers across India.'
    },
    {
      year: '2021',
      title: 'Luxury Brand Partners',
      description:
        'Collaborated with leading international premium fashion brands.'
    },
    {
      year: '2023',
      title: 'National Expansion',
      description:
        'Expanded operations to serve customers in every major Indian city.'
    },
    {
      year: '2025',
      title: 'Award Winner',
      description:
        'Recognized as one of the fastest growing luxury eCommerce brands.'
    }
  ];

  // =====================================
  // STAR ARRAY
  // =====================================

  getStars(rating: number): number[] {
    return Array(rating).fill(0);
  }

}
