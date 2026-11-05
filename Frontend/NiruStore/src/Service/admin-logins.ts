import { Service } from '@angular/core';
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, tap } from 'rxjs';

export interface AdminUser {
  id: string;
  name: string;
  email: string;
  role: 'admin';
}

export interface AdminLoginResponse {
  success: boolean;
  message: string;
  token: string;
  admin: AdminUser;
}

@Injectable({
  providedIn: 'root'
})
export class AdminLogins {
  private readonly apiUrl = 'https://nirustore-mean-1.onrender.com/api/admin';

  private readonly tokenKey = 'niruStoreAdminToken';
  private readonly adminKey = 'niruStoreAdminUser';

  constructor(private http: HttpClient) {}

  login(
    email: string,
    password: string
  ): Observable<AdminLoginResponse> {
    return this.http
      .post<AdminLoginResponse>(`${this.apiUrl}/login`, {
        email,
        password
      })
      .pipe(
        tap((response) => {
          if (
            response.success &&
            response.token &&
            response.admin?.role === 'admin'
          ) {
            localStorage.setItem(this.tokenKey, response.token);

            localStorage.setItem(
              this.adminKey,
              JSON.stringify(response.admin)
            );
          }
        })
      );
  }

  getToken(): string | null {
    return localStorage.getItem(this.tokenKey);
  }

  getAdmin(): AdminUser | null {
    try {
      const savedAdmin = localStorage.getItem(this.adminKey);

      return savedAdmin ? JSON.parse(savedAdmin) as AdminUser : null;
    } catch {
      return null;
    }
  }

  isLoggedIn(): boolean {
    return !!this.getToken() &&
      this.getAdmin()?.role === 'admin';
  }

  logout(): void {
    localStorage.removeItem(this.tokenKey);
    localStorage.removeItem(this.adminKey);
  }
}