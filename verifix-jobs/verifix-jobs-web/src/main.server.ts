import { bootstrapApplication } from '@angular/platform-browser';
import { provideServerRendering } from '@angular/platform-server';
import { provideRouter, withComponentInputBinding } from '@angular/router';
import { provideHttpClient, withFetch } from '@angular/common/http';
import { AppComponent } from './app/app.component';
import { appRoutes } from './app/app.routes';

const bootstrap = () =>
  bootstrapApplication(AppComponent, {
    providers: [
      provideRouter(appRoutes, withComponentInputBinding()),
      provideHttpClient(withFetch()),
      provideServerRendering(),
    ],
  });

export default bootstrap;
