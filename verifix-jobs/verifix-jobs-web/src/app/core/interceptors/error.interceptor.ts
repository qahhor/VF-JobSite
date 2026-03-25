import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { catchError, throwError } from 'rxjs';

export const errorInterceptor: HttpInterceptorFn = (req, next) => {
  const router = inject(Router);
  return next(req).pipe(
    catchError((error) => {
      if (error.status === 401 && !req.url.includes('/auth/')) {
        localStorage.removeItem('vjw_access_token');
        localStorage.removeItem('vjw_refresh_token');
        localStorage.removeItem('vjw_user');
        router.navigate(['/login']);
      }
      return throwError(() => error);
    })
  );
};
