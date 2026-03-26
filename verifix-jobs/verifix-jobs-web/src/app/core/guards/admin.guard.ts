import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';

export const adminGuard: CanActivateFn = () => {
  const router = inject(Router);
  const token = localStorage.getItem('vjw_admin_token');
  if (token) return true;
  router.navigate(['/admin/login']);
  return false;
};
