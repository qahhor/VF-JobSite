import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { catchError, switchMap, throwError } from 'rxjs';
import { AuthService } from '../services/auth.service';

let isRefreshing = false;

export const errorInterceptor: HttpInterceptorFn = (req, next) => {
  const router = inject(Router);
  const auth = inject(AuthService);

  return next(req).pipe(
    catchError((error) => {
      // Skip auth endpoints
      if (req.url.includes('/auth/') || req.url.includes('/admin/auth/')) {
        return throwError(() => error);
      }

      // 401 — try token refresh once
      if (error.status === 401 && !isRefreshing) {
        isRefreshing = true;
        const refreshObs = auth.refreshToken();

        if (refreshObs) {
          return refreshObs.pipe(
            switchMap((res: any) => {
              isRefreshing = false;
              if (res?.accessToken) {
                auth.setAuthFromTokens(res.accessToken, res.refreshToken);
                // Retry original request with new token
                const retryReq = req.clone({
                  setHeaders: { Authorization: `Bearer ${res.accessToken}` }
                });
                return next(retryReq);
              }
              return doLogout(auth, router, error);
            }),
            catchError((refreshErr) => {
              isRefreshing = false;
              return doLogout(auth, router, refreshErr);
            })
          );
        }

        isRefreshing = false;
        return doLogout(auth, router, error);
      }

      // Already refreshing or non-401 error
      if (error.status === 401) {
        return doLogout(auth, router, error);
      }

      return throwError(() => error);
    })
  );
};

function doLogout(auth: AuthService, router: Router, error: any) {
  auth.logout();
  return throwError(() => error);
}
