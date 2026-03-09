import * as jwt_decode from 'jwt-decode';
import { CanActivateFn, Router } from '@angular/router';

export const AdminGuard: CanActivateFn = (route, state) => {
  const token = localStorage.getItem('token');
  const router = new Router();

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