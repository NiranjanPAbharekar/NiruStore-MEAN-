import { Routes } from '@angular/router';

import { AdminLogin } from '../Pages/admin-login/admin-login';

// import { authGuard } from '../Guards/auth.guard';

import { authGuard } from '../app/Gaurds/admin-auth.guard';

export const routes: Routes = [

  // =========================================================
  // DEFAULT ROUTE
  // =========================================================

  {
    path: '',
    redirectTo: 'login',
    pathMatch: 'full'
  },


  // =========================================================
  // USER LOGIN
  // PUBLIC ROUTE
  // =========================================================

  {
    path: 'login',

    loadComponent: () =>
      import('../Pages/login/login')
        .then(m => m.Login)
  },


  // =========================================================
  // USER SIGN UP
  // PUBLIC ROUTE
  // =========================================================

  {
    path: 'SignUp',

    loadComponent: () =>
      import('../Pages/sign-up/sign-up')
        .then(m => m.SignUp)
  },


  // =========================================================
  // FORGOT PASSWORD
  // PUBLIC ROUTE
  // =========================================================

  {
    path: 'forgotPassword',

    loadComponent: () =>
      import('../Pages/forgate-password/forgate-password')
        .then(m => m.ForgatePassword)
  },


  // =========================================================
  // RESET PASSWORD
  // PUBLIC ROUTE
  // =========================================================

  {
    path: 'reset-password',

    loadComponent: () =>
      import('../Pages/reset-password/reset-password')
        .then(m => m.ResetPassword)
  },


  // =========================================================
  // ADMIN LOGIN
  // PUBLIC ROUTE
  // =========================================================

  {
    path: 'Admin/login',

    component: AdminLogin
  },


  // =========================================================
  // USER WEBSITE LAYOUT
  // PROTECTED ROUTE
  // =========================================================

  {
    path: '',

    canActivate: [authGuard],

    loadComponent: () =>
      import('../Pages/user-layout/user-layout')
        .then(m => m.UserLayout),

    children: [

      // =====================================================
      // HOME
      // =====================================================

      {
        path: 'Home',

        loadComponent: () =>
          import('../Pages/home/home')
            .then(m => m.Home)
      },


      // =====================================================
      // WATCHES
      // =====================================================

      {
        path: 'Watches',

        loadComponent: () =>
          import('../Pages/watch-page/watch-page')
            .then(m => m.WatchPage)
      },


      // =====================================================
      // BAGS
      // =====================================================

      {
        path: 'Bags',

        loadComponent: () =>
          import('../Pages/bag-page/bag-page')
            .then(m => m.BagPage)
      },


      // =====================================================
      // PERFUMES
      // =====================================================

      {
        path: 'Perfumes',

        loadComponent: () =>
          import('../Pages/perfumes/perfumes')
            .then(m => m.Perfumes)
      },


      // =====================================================
      // CART
      // =====================================================

      {
        path: 'Cart',

        loadComponent: () =>
          import('../Pages/cart/cart')
            .then(m => m.Cart)
      },


      // =====================================================
      // CHECKOUT
      // =====================================================

      {
        path: 'checkout',

        loadComponent: () =>
          import('../Pages/checkout/checkout')
            .then(m => m.Checkout)
      },


      // =====================================================
      // CONTACT
      // =====================================================

      {
        path: 'Contact',

        loadComponent: () =>
          import('../Pages/contact-us/contact-us')
            .then(m => m.ContactUs)
      },


      // =====================================================
      // ABOUT
      // =====================================================

      {
        path: 'About',

        loadComponent: () =>
          import('../Pages/about-us/about-us')
            .then(m => m.AboutUs)
      },


      // =====================================================
      // SHOP
      // =====================================================

      {
        path: 'Shop',

        loadComponent: () =>
          import('../Pages/products/products')
            .then(m => m.Products)
      },


      // =====================================================
      // BRANDS
      // =====================================================

      {
        path: 'Brands',

        loadComponent: () =>
          import('../Pages/brands/brands')
            .then(m => m.Brands)
      },


      // =====================================================
      // MY ACCOUNT
      // =====================================================

      {
        path: 'MyAccount',

        loadComponent: () =>
          import('../Pages/my-account/my-account')
            .then(m => m.MyAccount)
      },


      // =====================================================
      // ORDER TRACKING
      // =====================================================

      {
        path: 'OrderTracking',

        loadComponent: () =>
          import('../Pages/order-tracking/order-tracking')
            .then(m => m.OrderTracking)
      },


      // =====================================================
      // SHIPPING POLICY
      // =====================================================

      {
        path: 'ShippingPolicy',

        loadComponent: () =>
          import('../Pages/shipping-policy/shipping-policy')
            .then(m => m.ShippingPolicy)
      },


      // =====================================================
      // PRODUCT DETAILS
      // =====================================================

      {
        path: 'ProductDetails/:id',

        loadComponent: () =>
          import('../Pages/detailed-product/detailed-product')
            .then(m => m.DetailedProduct)
      },


      // =====================================================
      // RETURN POLICY
      // =====================================================

      {
        path: 'ReturnPolicy',

        loadComponent: () =>
          import('../Pages/return-policy/return-policy')
            .then(m => m.ReturnPolicy)
      },


      // =====================================================
      // PRIVACY POLICY
      // =====================================================

      {
        path: 'PrivacyPolicy',

        loadComponent: () =>
          import('../Pages/privacy-policy/privacy-policy')
            .then(m => m.PrivacyPolicy)
      }

    ]
  },


  // =========================================================
  // ADMIN DASHBOARD LAYOUT
  // PROTECTED ROUTE
  // =========================================================

  {
    path: 'Admin',

    canActivate: [authGuard],

    loadComponent: () =>
      import('../Pages/dashboard-layout/dashboard-layout')
        .then(m => m.DashboardLayout),

    children: [

      // =====================================================
      // ADMIN DEFAULT
      // =====================================================

      {
        path: '',

        redirectTo: 'dashboard',

        pathMatch: 'full'
      },


      // =====================================================
      // ADMIN DASHBOARD
      // =====================================================

      {
        path: 'dashboard',

        loadComponent: () =>
          import('../Pages/admin-dashboard/admin-dashboard')
            .then(m => m.AdminDashboard)
      },


      // =====================================================
      // ADMIN PRODUCTS
      // =====================================================

      {
        path: 'AdminProducts',

        loadComponent: () =>
          import('../Pages/admin-product/admin-product')
            .then(m => m.AdminProduct)
      },


      // =====================================================
      // ADMIN ORDERS
      // =====================================================

      {
        path: 'AdminOrders',

        loadComponent: () =>
          import('../Pages/admin-order/admin-order')
            .then(m => m.AdminOrder)
      },


      // =====================================================
      // ADMIN USERS
      // =====================================================

      {
        path: 'UserList',

        loadComponent: () =>
          import('../Pages/user-list/user-list')
            .then(m => m.UserListComponent)
      },


      // =====================================================
      // ADMIN SETTINGS
      // =====================================================

      {
        path: 'Setting',

        loadComponent: () =>
          import('../Pages/admin-setting/admin-setting')
            .then(m => m.AdminSetting)
      }

    ]
  },


  // =========================================================
  // UNKNOWN URL
  // =========================================================

  {
    path: '**',

    redirectTo: 'login'
  }

];