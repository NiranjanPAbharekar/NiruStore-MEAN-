
import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';

import { AdminLogins } from '../../Service/admin-logins';

@Component({
  selector: 'app-admin-login',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule
  ],
  templateUrl: './admin-login.html',
  styleUrl: './admin-login.css'
})
export class AdminLogin {
  email = '';
  password = '';

  showPassword = false;
  loading = false;
  errorMessage = '';

  constructor(
    private adminAuth: AdminLogins,
    private router: Router
  ) {}

  onLogin(): void {
    this.errorMessage = '';

    const email = this.email.trim().toLowerCase();

    if (!email || !this.password) {
      this.errorMessage =
        'Please enter your email and password.';
      return;
    }

    if (this.loading) {
      return;
    }

    this.loading = true;

    this.adminAuth.login(email, this.password).subscribe({
      next: (response) => {
        this.loading = false;

        if (
          response.success &&
          response.admin?.role === 'admin'
        ) {
          this.router.navigate(['/admin/dashboard']);
        } else {
          this.errorMessage =
            'Unable to verify administrator access.';
        }
      },

      error: (error) => {
        this.loading = false;

        this.errorMessage =
          error?.error?.message ||
          'Unable to log in. Please check your backend connection.';
      }
    });
  }
}
