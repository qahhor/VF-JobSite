import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { catchError, switchMap, throwError } from 'rxjs';
import { AuthService } from '../services/auth.service';

let isRefreshing = false;

export const errorInterceptor: HttpInterceptorFn = (req, next) => {
  const router = inject(Router);
  const auth = inject(AuthService);
  const isAdminApiRequest = req.url.includes('/api/v1/admin/');
  const isAdminLoginRequest = req.url.includes('/api/v1/admin/auth/login');
  const isProtectedAdminRequest = isAdminApiRequest && !isAdminLoginRequest;

  return next(req).pipe(
    catchError((error) => {
      if ((req.url.includes('/auth/') && !isAdminApiRequest) || isAdminLoginRequest) {
        return throwError(() => error);
      }

      if (error.status === 401 && isProtectedAdminRequest) {
        localStorage.removeItem('vjw_admin_token');
        localStorage.removeItem('vjw_admin_role');
        localStorage.removeItem('vjw_admin_must_change_password');
        router.navigate(['/admin/login']);
        return throwError(() => error);
      }

      if (error.status === 403 && isProtectedAdminRequest && error?.error?.error === 'PASSWORD_CHANGE_REQUIRED') {
        localStorage.setItem('vjw_admin_must_change_password', 'true');
        router.navigate(['/admin/access']);
        return throwError(() => error);
      }

      if (error.status === 401 && !isRefreshing) {
        isRefreshing = true;
        const refreshObs = auth.refreshToken();

        if (refreshObs) {
          return refreshObs.pipe(
            switchMap((res: any) => {
              isRefreshing = false;
              if (res?.accessToken) {
                auth.setAuthFromTokens(res.accessToken, res.refreshToken);
                const retryReq = req.clone({
                  setHeaders: { Authorization: `Bearer ${res.accessToken}` }
                });
                return next(retryReq);
              }
              return doLogout(auth, error);
            }),
            catchError((refreshErr) => {
              isRefreshing = false;
              return doLogout(auth, refreshErr);
            })
          );
        }

        isRefreshing = false;
        return doLogout(auth, error);
      }

      if (error.status === 401) {
        return doLogout(auth, error);
      }

      return throwError(() => error);
    })
  );
};

function doLogout(auth: AuthService, error: any) {
  auth.logout();
  return throwError(() => error);
}
