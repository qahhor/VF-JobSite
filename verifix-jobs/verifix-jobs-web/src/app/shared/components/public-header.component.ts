import { Component } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';

@Component({
  selector: 'vjw-public-header',
  standalone: true,
  imports: [RouterLink, RouterLinkActive],
  template: `
    <header class="bg-white border-b border-gray-100 sticky top-0 z-50">
      <div class="max-w-6xl mx-auto px-4 h-14 flex items-center justify-between">
        <a routerLink="/" class="flex items-center gap-2.5">
          <img src="assets/logo-icon.svg" alt="Verifix" class="h-7">
          <span class="font-semibold text-lg tracking-tight">Verifix Jobs</span>
        </a>
        <nav class="hidden md:flex items-center gap-8 text-sm">
          <a routerLink="/jobs" routerLinkActive="text-black font-medium" class="text-gray-500 hover:text-black transition">Vakansiyalar</a>
          <a routerLink="/companies" routerLinkActive="text-black font-medium" class="text-gray-500 hover:text-black transition">Kompaniyalar</a>
        </nav>
        <div class="flex items-center gap-3">
          <a routerLink="/login" class="hidden sm:inline text-sm font-medium text-black hover:underline">Kirish</a>
          <a routerLink="/login" class="bg-black text-white text-sm font-medium px-4 py-2 rounded-lg hover:bg-gray-800 transition">Ish beruvchi</a>
        </div>
      </div>
    </header>
  `,
})
export class PublicHeaderComponent {}
