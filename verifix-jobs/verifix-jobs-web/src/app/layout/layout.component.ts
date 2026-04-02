import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterOutlet, RouterLink, RouterLinkActive } from '@angular/router';
import { AuthService } from '../core/services/auth.service';

@Component({
  selector: 'vjw-layout',
  standalone: true,
  imports: [CommonModule, RouterOutlet, RouterLink, RouterLinkActive],
  template: `
    <aside class="hidden lg:flex flex-col w-64 bg-white border-r border-gray-200 fixed h-full z-30"
           [class.w-20]="collapsed" [class.w-64]="!collapsed">
      <div class="p-4 border-b border-gray-100 flex items-center gap-3">
        <div class="w-10 h-10 flex items-center"><img src="assets/logo-icon.svg" alt="Verifix" class="h-8"></div>
        <span *ngIf="!collapsed" class="font-semibold text-gray-800 text-lg">Verifix Jobs</span>
      </div>
      <nav class="flex-1 py-4 space-y-1 px-3">
        @for (item of navItems; track item.path) {
          <a [routerLink]="item.path" routerLinkActive="bg-gray-100 text-black"
             class="flex items-center gap-3 px-3 py-2.5 rounded-lg text-gray-600 hover:bg-gray-50 transition-colors">
            <span class="text-xl">{{ item.icon }}</span>
            <span *ngIf="!collapsed" class="text-sm font-medium">{{ item.label }}</span>
          </a>
        }
      </nav>
      <div class="p-3 border-t border-gray-100">
        <button (click)="collapsed = !collapsed"
                class="w-full flex items-center justify-center py-2 rounded-lg text-gray-400 hover:bg-gray-50">
          {{ collapsed ? '>' : '<' }}
        </button>
      </div>
    </aside>

    <div class="lg:transition-all" [class.lg:ml-64]="!collapsed" [class.lg:ml-20]="collapsed">
      <header class="sticky top-0 z-20 bg-white border-b border-gray-200 px-4 lg:px-6 h-16 flex items-center justify-between">
        <div class="flex items-center gap-4 min-w-0">
          <button class="lg:hidden text-2xl text-gray-600" (click)="mobileMenuOpen = !mobileMenuOpen" aria-label="Toggle menu">&#9776;</button>
          <h2 class="text-lg font-semibold text-gray-800 truncate">{{ pageTitle }}</h2>
        </div>
        <div class="flex items-center gap-4">
          <span class="hidden sm:block text-sm text-gray-500 max-w-[240px] truncate">{{ user()?.email }}</span>
          <button (click)="auth.logout()"
                  class="text-sm text-gray-500 hover:text-red-500 transition-colors">Chiqish</button>
        </div>
      </header>

      <main class="p-4 lg:p-6 min-h-[calc(100vh-4rem)]">
        <router-outlet />
      </main>
    </div>

    <nav class="lg:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 z-30 flex justify-around py-2 safe-bottom">
      @for (item of mobileNavItems; track item.path) {
        <a [routerLink]="item.path" routerLinkActive="text-black"
           class="flex flex-col items-center gap-0.5 text-gray-400 text-xs">
          <span class="text-lg">{{ item.icon }}</span>
          <span>{{ item.label }}</span>
        </a>
      }
    </nav>

    @if (mobileMenuOpen) {
      <div class="lg:hidden fixed inset-0 z-40 flex">
        <div class="absolute inset-0 bg-black/30" (click)="mobileMenuOpen = false"></div>
        <aside class="relative w-72 bg-white h-full shadow-xl">
          <div class="p-4 border-b">
            <div class="flex items-center gap-3">
              <div class="w-10 h-10 flex items-center"><img src="assets/logo-icon.svg" alt="Verifix" class="h-8"></div>
              <span class="font-semibold text-gray-800">Verifix Jobs</span>
            </div>
          </div>
          <nav class="py-4 px-3 space-y-1">
            @for (item of navItems; track item.path) {
              <a [routerLink]="item.path" routerLinkActive="bg-gray-100 text-black"
                 (click)="mobileMenuOpen = false"
                 class="flex items-center gap-3 px-3 py-2.5 rounded-lg text-gray-600 hover:bg-gray-50">
                <span class="text-xl">{{ item.icon }}</span>
                <span class="text-sm font-medium">{{ item.label }}</span>
              </a>
            }
          </nav>
        </aside>
      </div>
    }
  `,
  styles: [`
    .safe-bottom { padding-bottom: env(safe-area-inset-bottom, 0px); }
  `]
})
export class LayoutComponent {
  collapsed = false;
  mobileMenuOpen = false;
  pageTitle = 'Dashboard';

  constructor(public auth: AuthService) {}

  user = this.auth.user;

  navItems = [
    { path: '/employer/dashboard', icon: '\u{1F4CA}', label: 'Dashboard' },
    { path: '/employer/vacancies', icon: '\u{1F4CB}', label: 'Vakansiyalar' },
    { path: '/employer/pipeline', icon: '\u{1F504}', label: 'ATS Pipeline' },
    { path: '/employer/candidates', icon: '\u{1F465}', label: 'Nomzodlar' },
    { path: '/employer/talent-hub', icon: '\u{1F3AF}', label: 'Talent Hub' },
    { path: '/employer/hiring-projects', icon: '\u{1F680}', label: 'Loyihalar' },
    { path: '/employer/analytics', icon: '\u{1F4C8}', label: 'Analitika' },
    { path: '/employer/chat', icon: '\u{1F4AC}', label: 'Xabarlar' },
    { path: '/employer/billing', icon: '\u{1F4B3}', label: 'Billing' },
    { path: '/employer/ai-agent', icon: '\u{1F916}', label: 'AI Agent' },
    { path: '/employer/org-memory', icon: '\u{1F9E0}', label: 'Xotira' },
    { path: '/employer/integrations', icon: '\u{1F517}', label: 'Integratsiya' },
    { path: '/employer/settings', icon: '\u2699\uFE0F', label: 'Sozlamalar' },
  ];

  mobileNavItems = this.navItems.slice(0, 5);
}
