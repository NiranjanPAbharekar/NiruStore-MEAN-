import { inject } from '@angular/core';

import {
  CanActivateFn,
  Router
} from '@angular/router';

export const authGuard: CanActivateFn = (route, state) => {

  const router = inject(Router);

  // Get logged-in user
  const user = localStorage.getItem('user');

  // Get authentication token
  const token = localStorage.getItem('token');

  // Check authentication
  if (user && token) {

    try {

      const parsedUser = JSON.parse(user);

      if (parsedUser && parsedUser.id) {
        return true;
      }

    } catch (error) {

      console.error('Invalid user information:', error);

    }

  }

  // Clear invalid login information
  localStorage.removeItem('user');
  localStorage.removeItem('token');

  // Redirect to login
  return router.createUrlTree(['/login'], {
    queryParams: {
      returnUrl: state.url
    }
  });

};