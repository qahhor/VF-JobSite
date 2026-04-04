import { bootstrapApplication } from '@angular/platform-browser';
import { provideRouter, withComponentInputBinding } from '@angular/router';
import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { provideAnimationsAsync } from '@angular/platform-browser/animations/async';
import { AppComponent } from './app/app.component';
import { appRoutes } from './app/app.routes';
import { authInterceptor } from './app/core/interceptors/auth.interceptor';
import { errorInterceptor } from './app/core/interceptors/error.interceptor';
import { isDevMode } from '@angular/core';
import { provideServiceWorker } from '@angular/service-worker';

const isAdminRoute = typeof window !== 'undefined' && window.location.pathname.startsWith('/admin');

void cleanupAdminRouteCaching();

bootstrapApplication(AppComponent, {
  providers: [
    provideRouter(appRoutes, withComponentInputBinding()),
    provideHttpClient(withInterceptors([authInterceptor, errorInterceptor])),
    provideAnimationsAsync(), provideServiceWorker('ngsw-worker.js', {
            enabled: !isDevMode() && !isAdminRoute,
            registrationStrategy: 'registerWhenStable:30000'
          }),
  ]
}).catch((error) => console.error(error));

async function cleanupAdminRouteCaching() {
  if (typeof window === 'undefined' || !isAdminRoute) {
    return;
  }

  if (!('serviceWorker' in navigator)) {
    return;
  }

  const registrations = await navigator.serviceWorker.getRegistrations();
  if (!registrations.length) {
    sessionStorage.removeItem('vjw_admin_sw_reset');
    return;
  }

  await Promise.all(registrations.map((registration) => registration.unregister()));

  if ('caches' in window) {
    const cacheKeys = await caches.keys();
    await Promise.all(cacheKeys.map((key) => caches.delete(key)));
  }

  if (navigator.serviceWorker.controller && !sessionStorage.getItem('vjw_admin_sw_reset')) {
    sessionStorage.setItem('vjw_admin_sw_reset', '1');
    window.location.reload();
    return;
  }

  sessionStorage.removeItem('vjw_admin_sw_reset');
}
