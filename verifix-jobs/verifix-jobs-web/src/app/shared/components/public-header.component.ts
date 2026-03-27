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
    <header class="bg-white border-b border-gray-100 sticky top-0 z-50">
      <div class="max-w-6xl mx-auto px-4 h-14 flex items-center justify-between">
        <a routerLink="/" class="flex items-center gap-2">
          <img src="assets/logo-icon.svg" alt="Verifix" class="h-7">
          <span class="font-bold text-lg tracking-tight hidden sm:inline">Verifix Jobs</span>
        </a>

        <!-- Desktop nav -->
        <nav class="hidden md:flex items-center gap-6 text-sm">
          <a routerLink="/jobs" routerLinkActive="text-black font-semibold" class="text-gray-500 hover:text-black transition">{{ i18n.t('nav.vacancies') }}</a>
          <a routerLink="/companies" routerLinkActive="text-black font-semibold" class="text-gray-500 hover:text-black transition">{{ i18n.t('nav.companies') }}</a>
          <a routerLink="/map" routerLinkActive="text-black font-semibold" class="text-gray-500 hover:text-black transition">📍 {{ i18n.t('nav.map') }}</a>
          <a routerLink="/salary" routerLinkActive="text-black font-semibold" class="text-gray-500 hover:text-black transition">💰 {{ i18n.t('nav.salary') }}</a>
        </nav>

        <div class="flex items-center gap-2">
          <vjw-lang-switcher />
          <a routerLink="/login" class="hidden sm:inline-flex items-center h-9 px-4 text-sm font-medium text-gray-700 border border-gray-200 rounded-lg hover:bg-gray-50 transition">{{ i18n.t('nav.login') }}</a>
          <a routerLink="/login" class="h-9 px-4 bg-black text-white text-sm font-medium rounded-lg hover:bg-gray-800 transition flex items-center">{{ i18n.t('auth.employer') }}</a>
        </div>
      </div>
    </header>

    <!-- Mobile bottom nav — thumb-friendly for blue-collar users -->
    <nav class="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-gray-100 z-50 safe-bottom">
      <div class="grid grid-cols-4 h-16">
        <a routerLink="/" routerLinkActive="text-black" [routerLinkActiveOptions]="{exact:true}"
           class="flex flex-col items-center justify-center gap-0.5 text-gray-400">
          <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"/></svg>
          <span class="text-[10px] font-medium">{{ i18n.t('nav.home') }}</span>
        </a>
        <a routerLink="/jobs" routerLinkActive="text-black"
           class="flex flex-col items-center justify-center gap-0.5 text-gray-400">
          <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"/></svg>
          <span class="text-[10px] font-medium">{{ i18n.t('nav.jobs') }}</span>
        </a>
        <a routerLink="/companies" routerLinkActive="text-black"
           class="flex flex-col items-center justify-center gap-0.5 text-gray-400">
          <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"/></svg>
          <span class="text-[10px] font-medium">{{ i18n.t('nav.companies') }}</span>
        </a>
        <a routerLink="/login" routerLinkActive="text-black"
           class="flex flex-col items-center justify-center gap-0.5 text-gray-400">
          <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"/></svg>
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
  constructor(public i18n: I18nService) {}
}
