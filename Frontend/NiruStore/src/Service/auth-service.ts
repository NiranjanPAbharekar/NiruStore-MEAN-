import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';


// ==============================
// Login Request
// ==============================

export interface LoginRequest {
  email: string;
  password: string;
}


// ==============================
// User
// ==============================

export interface User {
  id: string;
  name: string;
  email: string;
}


// ==============================
// Login Response
// ==============================

export interface LoginResponse {
  status: string;
  message: string;
  user: User;
   token?: string;
  accessToken?: string;
}


@Injectable({
  providedIn: 'root'
})
export class AuthService {

  private url = 'http://localhost:8040/api';


  constructor(
    private http: HttpClient
  ) {}


  // ==============================
  // REGISTER
  // ==============================

  register(user: any): Observable<any> {

    return this.http.post(
      `${this.url}/register`,
      user
    );

  }


  // ==============================
  // LOGIN
  // ==============================

  login(
    user: LoginRequest
  ): Observable<LoginResponse> {

    return this.http.post<LoginResponse>(
      `${this.url}/login`,
      user
    );

  }

}