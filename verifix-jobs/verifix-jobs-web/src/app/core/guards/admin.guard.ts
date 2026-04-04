import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';

function isTokenExpired(token: string): boolean {
  try {
    const payload = JSON.parse(atob(token.split('.')[1]));
    return payload.exp * 1000 < Date.now();
  } catch {
    return true;
  }
}

export const adminGuard: CanActivateFn = (_, state) => {
  const router = inject(Router);
  const token = localStorage.getItem('vjw_admin_token');
  if (!token || isTokenExpired(token)) {
    localStorage.removeItem('vjw_admin_token');
    localStorage.removeItem('vjw_admin_role');
    localStorage.removeItem('vjw_admin_must_change_password');
    router.navigate(['/admin/login']);
    return false;
  }

  const mustChangePassword = localStorage.getItem('vjw_admin_must_change_password') === 'true';
  if (mustChangePassword && !state.url.startsWith('/admin/access')) {
    router.navigate(['/admin/access']);
    return false;
  }

  return true;
};
