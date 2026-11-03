import {
  Component,
  OnDestroy,
  OnInit,
  ChangeDetectorRef
} from '@angular/core';

import { CommonModule } from '@angular/common';

import {
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  Validators
} from '@angular/forms';

import {
  Router,
  RouterLink,
  ActivatedRoute
} from '@angular/router';

import { AuthService } from '../../Service/auth-service';
import { CartService } from '../../Service/cart-product';
import { WishlistService } from '../../Service/wishlist-product';


@Component({
  standalone: true,
  selector: 'app-login',

  imports: [
    CommonModule,
    ReactiveFormsModule,
    RouterLink
  ],

  templateUrl: './login.html',
  styleUrl: './login.css'
})
export class Login implements OnInit, OnDestroy {

  // =====================================================
  // LOGIN FORM
  // =====================================================

  loginForm: FormGroup;


  // =====================================================
  // SLIDER
  // =====================================================

  images: string[] = [
    'assets/login/Perfume1.jpg',
    'assets/login/Perfume2.jpg',
    'assets/login/Perfume3.jpg',
    'assets/login/watch1.jpg',
    'assets/login/watch2.jpg',
    'assets/login/watch3.jpg'
  ];

  currentSlide = 0;

  intervalId: any;


  // =====================================================
  // PASSWORD
  // =====================================================

  showPassword = false;


  // =====================================================
  // POPUP
  // =====================================================

  showPopup = false;

  popupTitle = '';

  popupMessage = '';

  popupType: 'error' | 'success' = 'error';


  // =====================================================
  // CONSTRUCTOR
  // =====================================================
constructor(
  private fb: FormBuilder,
  private authService: AuthService,
  private router: Router,
  private route: ActivatedRoute,
  private wishlistService: WishlistService,
  private cartService: CartService,
  private cdr: ChangeDetectorRef
) {

    this.loginForm = this.fb.group({

      email: [
        '',
        [
          Validators.required,
          Validators.email
        ]
      ],

      password: [
        '',
        [
          Validators.required
        ]
      ]

    });

  }


  // =====================================================
  // INIT
  // =====================================================

  ngOnInit(): void {

    this.startSlider();

  }


  // =====================================================
  // DESTROY
  // =====================================================

  ngOnDestroy(): void {

    if (this.intervalId) {

      clearInterval(this.intervalId);

    }

  }


  // =====================================================
  // SLIDER
  // =====================================================

  startSlider(): void {

    this.intervalId = setInterval(() => {

      this.nextSlide();

    }, 3000);

  }


  nextSlide(): void {

    this.currentSlide =
      (this.currentSlide + 1) %
      this.images.length;

  }


  previousSlide(): void {

    this.currentSlide =
      (this.currentSlide - 1 + this.images.length) %
      this.images.length;

  }


  goToSlide(index: number): void {

    this.currentSlide = index;

  }


  // =====================================================
  // PASSWORD TOGGLE
  // =====================================================

  togglePassword(): void {

    this.showPassword =
      !this.showPassword;

  }


  // =====================================================
  // LOGIN
  // =====================================================

  onLogin(): void {

    console.log('========================');

    console.log(
      'LOGIN BUTTON CLICKED'
    );

    console.log(
      'Form valid:',
      this.loginForm.valid
    );

    console.log(
      'Form value:',
      this.loginForm.value
    );

    console.log('========================');


    // ===================================================
    // VALIDATION
    // ===================================================

    if (this.loginForm.invalid) {

      console.log(
        '❌ FORM INVALID'
      );

      this.loginForm.markAllAsTouched();

      return;

    }


    console.log(
      '✅ FORM VALID'
    );


    // ===================================================
    // LOGIN DATA
    // ===================================================

    const email =
      this.loginForm.value.email
        ?.trim()
        .toLowerCase();

    const password =
      this.loginForm.value.password;


    const loginData = {

      email: email,

      password: password

    };


    console.log(
      '📤 Sending login request:',
      loginData
    );


    // ===================================================
    // API
    // ===================================================

    this.authService
      .login(loginData)
      .subscribe({

        // ===============================================
        // SUCCESS
        // ===============================================

       next: (response: any) => {
  console.log('LOGIN API RESPONSE:', response);

  if (!response?.user || !response?.token) {
    console.error('Login response is missing user or token.');
    this.popupType = 'error';
    this.popupTitle = 'Login Error';
    this.popupMessage = 'Authentication data was not returned. Please try again.';
    this.showPopup = true;
    this.cdr.detectChanges();
    return;
  }

  localStorage.setItem(
    'user',
    JSON.stringify(response.user)
  );

  localStorage.setItem(
    'token',
    response.token
  );
  this.wishlistService.refreshWishlistForCurrentUser();
this.cartService.refreshCartForCurrentUser();

  console.log('User and token saved successfully.');

  this.cdr.detectChanges();

  // setTimeout(() => {
  //   this.showPopup = false;
  //   this.cdr.detectChanges();
  //   this.router.navigate(['/Home']);
  // }, 1500);
  setTimeout(() => {

  this.showPopup = false;

  this.cdr.detectChanges();

  const returnUrl =
    this.route.snapshot.queryParams['returnUrl'];

  this.router.navigateByUrl(
    returnUrl || '/Home'
  );

}, 1500);
},


        // ===============================================
        // ERROR
        // ===============================================

        error: (error: any) => {

          console.log(
            '❌ LOGIN API ERROR'
          );

          console.log(
            'Status:',
            error.status
          );

          console.log(
            'Error:',
            error
          );

          console.log(
            'Backend response:',
            error.error
          );


          // =============================================
          // ERROR POPUP
          // =============================================

          this.popupType = 'error';


          if (error.status === 0) {

            this.popupTitle =
              'Server Not Available';

            this.popupMessage =
              'Unable to connect to the server. Please make sure the backend server is running.';

          }

          else if (error.status === 404) {

            this.popupTitle =
              'User Not Found';

            this.popupMessage =
              error.error?.message ||
              'User does not exist. Please signup first.';

          }

          else if (error.status === 401) {

            this.popupTitle =
              'Login Failed';

            this.popupMessage =
              error.error?.message ||
              'Incorrect email or password.';

          }

          else if (error.status === 400) {

            this.popupTitle =
              'Invalid Details';

            this.popupMessage =
              error.error?.message ||
              'Please enter valid login details.';

          }

          else {

            this.popupTitle =
              'Something Went Wrong';

            this.popupMessage =
              error.error?.message ||
              'Unable to login. Please try again.';

          }


          // =============================================
          // SHOW POPUP
          // =============================================

          this.showPopup = true;


          console.log(
            '🔥 ERROR showPopup:',
            this.showPopup
          );

          console.log(
            '🔥 POPUP TITLE:',
            this.popupTitle
          );

          console.log(
            '🔥 POPUP MESSAGE:',
            this.popupMessage
          );


          // =============================================
          // FORCE UI UPDATE
          // =============================================

          this.cdr.detectChanges();

        }

      });

  }


  // =====================================================
  // CLOSE POPUP
  // =====================================================

  closePopup(): void {

    console.log(
      'Closing popup'
    );

    this.showPopup = false;

    this.cdr.detectChanges();

  }


  // =====================================================
  // SIGNUP
  // =====================================================

  goToSignup(): void {

    this.showPopup = false;

    this.cdr.detectChanges();

    this.router.navigate([
      '/SignUp'
    ]);

  }

}