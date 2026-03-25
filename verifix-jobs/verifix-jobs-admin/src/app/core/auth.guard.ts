import { CanActivateFn, Router } from '@angular/router';
import { inject } from '@angular/core';

export const adminAuthGuard: CanActivateFn = () => {
  const router = inject(Router);
  if (localStorage.getItem('vja_token')) return true;
  router.navigate(['/login']);
  return false;
};
