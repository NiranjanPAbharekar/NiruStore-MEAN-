
import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { HttpClient } from '@angular/common/http';

@Component({
  selector: 'app-reset-password',
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './reset-password.html',
  styleUrl: './reset-password.css',
})
export class ResetPassword {
   token = '';

  newPassword = '';
  confirmPassword = '';

  showPassword = false;
  showConfirmPassword = false;

  loading = false;
  successMessage = '';
  errorMessage = '';

  constructor(
    private route: ActivatedRoute,
    private http: HttpClient,
    private router: Router
  ) {
    this.token =
      this.route.snapshot.queryParamMap.get('token') || '';

    if (!this.token) {
      this.errorMessage =
        'This password reset link is invalid or missing its token.';
    }
  }

  resetPassword(): void {
    this.successMessage = '';
    this.errorMessage = '';

    if (!this.token) {
      this.errorMessage =
        'Reset token is missing. Please request a new reset link.';
      return;
    }

    if (!this.newPassword || !this.confirmPassword) {
      this.errorMessage = 'Please fill in both password fields.';
      return;
    }

    if (this.newPassword.length < 8) {
      this.errorMessage =
        'Password must contain at least 8 characters.';
      return;
    }

    if (this.newPassword !== this.confirmPassword) {
      this.errorMessage = 'Passwords do not match.';
      return;
    }

    this.loading = true;

    this.http.post<any>(
      'http://localhost:8040/api/reset-password',
      {
        token: this.token,
        newPassword: this.newPassword
      }
    ).subscribe({
      next: (response) => {
        this.loading = false;

        this.successMessage =
          response.message || 'Password reset successfully!';

        this.newPassword = '';
        this.confirmPassword = '';
        this.token = '';

        // Navigate to login after displaying success.
        setTimeout(() => {
          this.router.navigate(['/login']);
        }, 2000);
      },

      error: (error) => {
        this.loading = false;

        this.errorMessage =
          error.error?.message ||
          'Unable to reset your password. The link may have expired.';
      }
    });
  }
}
