import { Component, signal } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'vjw-public-header',
  standalone: true,
  imports: [CommonModule, RouterLink, RouterLinkActive],
  template: `
    <header class="bg-white border-b border-gray-100 sticky top-0 z-50">
      <div class="max-w-6xl mx-auto px-4 h-14 flex items-center justify-between">
        <a routerLink="/" class="flex items-center gap-2.5">
          <img src="assets/logo-icon.svg" alt="Verifix" class="h-7">
          <span class="font-semibold text-lg tracking-tight">Verifix Jobs</span>
        </a>

        <!-- Desktop nav -->
        <nav class="hidden md:flex items-center gap-8 text-sm">
          <a routerLink="/jobs" routerLinkActive="text-black font-medium" class="text-gray-500 hover:text-black transition">Vakansiyalar</a>
          <a routerLink="/companies" routerLinkActive="text-black font-medium" class="text-gray-500 hover:text-black transition">Kompaniyalar</a>
        </nav>

        <div class="flex items-center gap-3">
          <!-- Desktop buttons -->
          <a routerLink="/login" class="hidden sm:inline text-sm font-medium text-black hover:underline">Kirish</a>
          <a routerLink="/login" class="hidden sm:inline bg-black text-white text-sm font-medium px-4 py-2 rounded-lg hover:bg-gray-800 transition">Ish beruvchi</a>

          <!-- Mobile hamburger -->
          <button (click)="mobileMenu.set(!mobileMenu())" class="md:hidden p-2 -mr-2">
            @if (mobileMenu()) {
              <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/></svg>
            } @else {
              <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16"/></svg>
            }
          </button>
        </div>
      </div>

      <!-- Mobile menu -->
      @if (mobileMenu()) {
        <div class="md:hidden border-t border-gray-100 bg-white">
          <nav class="max-w-6xl mx-auto px-4 py-3 space-y-1">
            <a routerLink="/jobs" (click)="mobileMenu.set(false)" class="block py-2.5 px-3 text-sm text-gray-700 hover:bg-gray-50 rounded-lg">Vakansiyalar</a>
            <a routerLink="/companies" (click)="mobileMenu.set(false)" class="block py-2.5 px-3 text-sm text-gray-700 hover:bg-gray-50 rounded-lg">Kompaniyalar</a>
            <hr class="my-2 border-gray-100">
            <a routerLink="/login" (click)="mobileMenu.set(false)" class="block py-2.5 px-3 text-sm font-medium text-black hover:bg-gray-50 rounded-lg">Kirish</a>
            <a routerLink="/login" (click)="mobileMenu.set(false)" class="block py-2.5 px-3 text-sm font-medium bg-black text-white rounded-lg text-center">Ish beruvchi</a>
          </nav>
        </div>
      }
    </header>
  `,
})
export class PublicHeaderComponent {
  mobileMenu = signal(false);
}
