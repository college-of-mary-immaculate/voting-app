import { CanActivateFn, Router } from '@angular/router';
import { inject } from '@angular/core';
import * as jwt_decode from 'jwt-decode';

export const AdminGuard: CanActivateFn = (route, state) => {

  const router = inject(Router);
  const token = localStorage.getItem('token');

  if (!token) {
    alert('You must log in!');
    router.navigate(['/login']);
    return false;
  }

  try {
    const decoded: any = (jwt_decode as any)(token);

    if (decoded.role !== 'admin') {
      alert('Access denied! Admins only.');
      router.navigate(['/']);
      return false;
    }

  } catch (err) {
    console.error('Invalid token', err);
    router.navigate(['/login']);
    return false;
  }

  return true;
};