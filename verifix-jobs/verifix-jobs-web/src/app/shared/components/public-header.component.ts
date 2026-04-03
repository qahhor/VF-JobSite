import { Component, signal } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { CommonModule } from '@angular/common';
import { LangSwitcherComponent } from './lang-switcher.component';
import { I18nService } from '../../core/services/i18n.service';

@Component({
  selector: 'vjw-public-header',
  standalone: true,
  imports: [CommonModule, RouterLink, RouterLinkActive, LangSwitcherComponent],
  template: `
    <header class="sticky top-0 z-50 border-b border-gray-100 bg-white/95 backdrop-blur">
      <div class="mx-auto grid max-w-7xl grid-cols-[auto_1fr] items-center gap-4 px-4 py-3 md:grid-cols-[minmax(220px,1fr)_auto_minmax(220px,1fr)]">
        <a routerLink="/" class="flex min-w-0 items-center gap-3">
          <img src="assets/logo-icon.svg" alt="Verifix" class="h-8 shrink-0">
          <span class="hidden truncate text-xl font-bold tracking-tight text-gray-950 sm:inline">Verifix Jobs</span>
        </a>

        <nav class="hidden items-center justify-center gap-1 justify-self-center md:flex">
          @for (item of desktopNav; track item.path) {
            <a
              [routerLink]="item.path"
              routerLinkActive="bg-gray-900 text-white shadow-sm"
              [routerLinkActiveOptions]="item.exact ? { exact: true } : { exact: false }"
              class="inline-flex h-10 items-center justify-center whitespace-nowrap rounded-xl px-4 text-sm font-medium text-gray-600 transition hover:bg-gray-50 hover:text-black">
              {{ i18n.t(item.label) }}
            </a>
          }
        </nav>

        <div class="flex min-w-0 items-center justify-end gap-2">
          <vjw-lang-switcher />
          <a
            routerLink="/login"
            class="hidden h-10 items-center whitespace-nowrap rounded-xl border border-gray-200 px-5 text-sm font-medium text-gray-700 transition hover:bg-gray-50 sm:inline-flex">
            {{ i18n.t('nav.login') }}
          </a>
          <a
            routerLink="/login"
            class="inline-flex h-10 items-center whitespace-nowrap rounded-xl bg-black px-5 text-sm font-semibold text-white transition hover:bg-gray-800">
            {{ i18n.t('auth.employer') }}
          </a>
        </div>
      </div>
    </header>

    <nav class="safe-bottom fixed bottom-0 left-0 right-0 z-50 border-t border-gray-100 bg-white md:hidden">
      <div class="grid h-16 grid-cols-4">
        <a routerLink="/" routerLinkActive="text-black" [routerLinkActiveOptions]="{ exact: true }"
           class="flex flex-col items-center justify-center gap-0.5 text-gray-400">
          <svg class="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"/></svg>
          <span class="text-[10px] font-medium">{{ i18n.t('nav.home') }}</span>
        </a>
        <a routerLink="/jobs" routerLinkActive="text-black"
           class="flex flex-col items-center justify-center gap-0.5 text-gray-400">
          <svg class="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"/></svg>
          <span class="text-[10px] font-medium">{{ i18n.t('nav.jobs') }}</span>
        </a>
        <a routerLink="/companies" routerLinkActive="text-black"
           class="flex flex-col items-center justify-center gap-0.5 text-gray-400">
          <svg class="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"/></svg>
          <span class="text-[10px] font-medium">{{ i18n.t('nav.companies') }}</span>
        </a>
        <a routerLink="/login" routerLinkActive="text-black"
           class="flex flex-col items-center justify-center gap-0.5 text-gray-400">
          <svg class="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"/></svg>
          <span class="text-[10px] font-medium">{{ i18n.t('nav.profile') }}</span>
        </a>
      </div>
    </nav>
  `,
  styles: [`
    .safe-bottom { padding-bottom: env(safe-area-inset-bottom, 0px); }
  `]
})
export class PublicHeaderComponent {
  mobileMenu = signal(false);
  readonly desktopNav = [
    { path: '/jobs', label: 'nav.vacancies', exact: false },
    { path: '/companies', label: 'nav.companies', exact: false },
    { path: '/map', label: 'nav.map', exact: false },
    { path: '/salary', label: 'nav.salary', exact: false }
  ];

  constructor(public i18n: I18nService) {}
}
