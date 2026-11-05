import { CommonModule, NgIf } from '@angular/common';
import { Component, NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { HttpClient } from '@angular/common/http';

@Component({
  selector: 'app-forgate-password',
  imports: [CommonModule,FormsModule,RouterLink],
  templateUrl: './forgate-password.html',
  styleUrl: './forgate-password.css',
})
export class ForgatePassword {
  // Password Fields
  email: string = '';
  // newPassword: string = '';
  // confirmPassword: string = '';

  // Error Messages
  emailError: string = '';
  // // newPasswordError: string = '';
  // // confirmPasswordError: string = '';

  // UI State
  showemail = false;
  showNewPassword = false;
  showConfirmPassword = false;

  loading = false;
  passwordChanged = false;
  constructor(private http: HttpClient) {}

  // ============================
  // Change Password
  // ============================

changePassword() {
  // Reset errors
  this.emailError = '';
  // this.newPasswordError = '';
  // this.confirmPasswordError = '';

  // Validate email
  if (!this.email.trim()) {
    this.emailError = 'Email address is required.';
    return;
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  if (!emailRegex.test(this.email.trim())) {
    this.emailError = 'Please enter a valid email address.';
    return;
  }

  // Show loader
  this.loading = true;
  this.passwordChanged = false;

  this.http.post(
    'https://nirustore-mean-1.onrender.com/api/forgot-password',
    { email: this.email.trim().toLowerCase() }
  ).subscribe({
    next: (response: any) => {
      this.loading = false;
      this.passwordChanged = true;

      // Clear email field
      this.email = '';

      console.log(response.message);
    },
    error: (error) => {
      this.loading = false;

      console.error(
        'Forgot password request failed:',
        error
      );
    }
  });
}
}
