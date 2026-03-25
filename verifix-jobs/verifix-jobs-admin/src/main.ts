import { bootstrapApplication } from '@angular/platform-browser';
import { provideRouter, withComponentInputBinding } from '@angular/router';
import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { provideAnimationsAsync } from '@angular/platform-browser/animations/async';
import { AdminAppComponent } from './app/app.component';
import { adminRoutes } from './app/app.routes';
import { adminAuthInterceptor } from './app/core/auth.interceptor';

bootstrapApplication(AdminAppComponent, {
  providers: [
    provideRouter(adminRoutes, withComponentInputBinding()),
    provideHttpClient(withInterceptors([adminAuthInterceptor])),
    provideAnimationsAsync(),
  ]
}).catch((error) => console.error(error));
