import { Service } from '@angular/core';
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
export interface HeroSlide {
  _id?: string;
  image: string;
  alt: string;
  eyebrow: string;
  title: string;
  highlight: string;
  description: string;
}

export interface Collection {
  _id?: string;
  name: string;
  image: string;
  categoryKey: string;
  items: number;
}

export interface HomeContentResponse {
  success: boolean;
  heroSlides: HeroSlide[];
  collections: Collection[];
}



@Injectable({
  providedIn: 'root'
})
export class HomeContent {
      private readonly apiUrl =
    'https://nirustore-mean-1.onrender.com/api/home-content';

  constructor(private http: HttpClient) {}

  getHomeContent(): Observable<HomeContentResponse> {
    return this.http.get<HomeContentResponse>(
      this.apiUrl
    );
  }
  
}
