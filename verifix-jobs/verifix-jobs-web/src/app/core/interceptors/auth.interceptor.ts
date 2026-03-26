import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { AuthService } from '../services/auth.service';

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const auth = inject(AuthService);

  // Use admin token for admin API calls
  if (req.url.includes('/admin/') && !req.url.includes('/admin/auth/')) {
    const adminToken = localStorage.getItem('vjw_admin_token');
    if (adminToken) {
      req = req.clone({ setHeaders: { Authorization: `Bearer ${adminToken}` } });
    }
    return next(req);
  }

  // Use employer token for all other authenticated calls
  const token = auth.getToken();
  if (token && !req.url.includes('/auth/')) {
    req = req.clone({ setHeaders: { Authorization: `Bearer ${token}` } });
  }
  return next(req);
};
