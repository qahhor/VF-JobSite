import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';

export const adminGuard: CanActivateFn = (_, state) => {
  const router = inject(Router);
  const token = localStorage.getItem('vjw_admin_token');
  if (!token) {
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
